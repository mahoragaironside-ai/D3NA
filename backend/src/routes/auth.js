import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { generateOtpCode, sendOtpSms, hashOtp, verifyOtp, otpExpiry } from "../ai/otpService.js";
import { isTestPhone, TEST_PASSWORD } from "../lib/testAccount.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { phone_number, password } = req.body;
  if (!phone_number || !password || password.length < 6) {
    return res.status(400).json({ error: "Número de telefone e palavra-passe (mín. 6 caracteres) são obrigatórios." });
  }
  const existing = await query("SELECT user_id FROM users WHERE phone_number = $1", [phone_number]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "Este número já está registado." });
  }
  const password_hash = await bcrypt.hash(password, 12);
  const result = await query(
    "INSERT INTO users (phone_number, password_hash) VALUES ($1, $2) RETURNING user_id, phone_number",
    [phone_number, password_hash]
  );
  const user = result.rows[0];
  const token = signToken(user.user_id);
  res.status(201).json({ access_token: token, user });
});

router.post("/login", async (req, res) => {
  const { phone_number, password } = req.body;

  // Conta de teste: cria-se sozinha no primeiro login, sem passar por /register.
  if (isTestPhone(phone_number) && password === TEST_PASSWORD) {
    const existing = await query("SELECT user_id FROM users WHERE phone_number = $1", [phone_number]);
    if (existing.rows.length === 0) {
      const password_hash = await bcrypt.hash(TEST_PASSWORD, 12);
      await query(
        "INSERT INTO users (phone_number, password_hash, phone_verified, subscription_status) VALUES ($1, $2, TRUE, 'ativo')",
        [phone_number, password_hash]
      );
    }
  }

  const result = await query("SELECT * FROM users WHERE phone_number = $1", [phone_number]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Credenciais inválidas." });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });
  const token = signToken(user.user_id);
  res.json({
    access_token: token,
    user: { user_id: user.user_id, phone_number: user.phone_number, subscription_status: user.subscription_status },
  });
});

function signToken(user_id) {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

// Dados do utilizador autenticado (usado pelo frontend para saber se o telefone já está verificado).
router.get("/me", requireAuth, async (req, res) => {
  const result = await query("SELECT user_id, phone_number, phone_verified, subscription_status FROM users WHERE user_id = $1", [req.userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Utilizador não encontrado." });
  res.json(result.rows[0]);
});

// Envia um código de 6 dígitos por SMS (via httpSMS) para verificar o número do utilizador autenticado.
router.post("/otp/send", requireAuth, async (req, res) => {
  const user = await query("SELECT phone_number FROM users WHERE user_id = $1", [req.userId]);
  if (user.rows.length === 0) return res.status(404).json({ error: "Utilizador não encontrado." });

  const code = generateOtpCode();
  const hash = await hashOtp(code);
  await query("UPDATE users SET otp_code_hash = $1, otp_expires_at = $2 WHERE user_id = $3", [hash, otpExpiry(), req.userId]);

  try {
    await sendOtpSms(user.rows[0].phone_number, code);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
  res.json({ sent: true });
});

// Confirma o código recebido por SMS.
router.post("/otp/verify", requireAuth, async (req, res) => {
  const { code } = req.body;
  const result = await query("SELECT otp_code_hash, otp_expires_at FROM users WHERE user_id = $1", [req.userId]);
  const row = result.rows[0];
  if (!row || !row.otp_code_hash) return res.status(400).json({ error: "Nenhum código pendente. Pede um novo." });
  if (new Date(row.otp_expires_at) < new Date()) return res.status(400).json({ error: "Código expirado. Pede um novo." });

  const ok = await verifyOtp(code, row.otp_code_hash);
  if (!ok) return res.status(400).json({ error: "Código incorreto." });

  await query("UPDATE users SET phone_verified = TRUE, otp_code_hash = NULL, otp_expires_at = NULL WHERE user_id = $1", [req.userId]);
  res.json({ verified: true });
});

export default router;
