import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdminKey } from "../middleware/auth.js";
import { sendNotificationSms } from "../services/notifications.js";

const router = Router();

// Cria um pedido de subscrição pendente e devolve o link de pagamento.
router.post("/create", requireAuth, async (req, res) => {
  const plan = req.body.plan === "premium" ? "premium" : "normal";
  const reference = plan === "premium" ? process.env.PAYMENT_REFERENCE_PREMIUM : process.env.PAYMENT_REFERENCE;
  const amount = plan === "premium" ? process.env.PAYMENT_AMOUNT_PREMIUM : process.env.PAYMENT_AMOUNT;

  if (plan === "premium" && !reference) {
    return res.status(400).json({ error: "O plano Premium ainda não está configurado (falta PAYMENT_REFERENCE_PREMIUM)." });
  }

  const result = await query(
    `INSERT INTO subscriptions (user_id, plan_name, payment_reference, amount, currency, payment_status)
     VALUES ($1, $2, $3, $4, $5, 'pendente') RETURNING *`,
    [req.userId, plan === "premium" ? "premium" : "consultoria_semanal", reference, amount, process.env.PAYMENT_CURRENCY]
  );
  res.status(201).json({
    subscription: result.rows[0],
    payment_url: plan === "premium" ? process.env.PAYMENT_URL_PREMIUM : process.env.PAYMENT_URL,
    payment_reference: reference,
    payment_description: plan === "premium" ? "Consultoria Premium semanal" : process.env.PAYMENT_DESCRIPTION,
    payment_amount: amount,
    payment_currency: process.env.PAYMENT_CURRENCY,
    plan,
  });
});

// Estado da subscrição do utilizador autenticado.
router.get("/status", requireAuth, async (req, res) => {
  const result = await query(
    "SELECT subscription_status FROM users WHERE user_id = $1",
    [req.userId]
  );
  const latest = await query(
    `SELECT * FROM subscriptions WHERE user_id = $1 AND payment_status = 'confirmado'
     ORDER BY expires_at DESC LIMIT 1`,
    [req.userId]
  );
  const activeSub = latest.rows[0];
  const isActive = activeSub && new Date(activeSub.expires_at) > new Date();
  res.json({
    subscription_status: isActive ? "ativo" : "inativo",
    plan_name: isActive ? (activeSub.plan_name === "premium" ? "premium" : "normal") : null,
    latest: activeSub || null,
  });
});

// Lista subscrições pendentes de confirmação — alimenta o painel administrativo.
router.get("/pending", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT s.subscription_id, s.amount, s.currency, s.payment_reference, s.payment_status, s.created_at,
            u.phone_number
     FROM subscriptions s JOIN users u ON u.user_id = s.user_id
     WHERE s.payment_status = 'pendente'
     ORDER BY s.created_at ASC`
  );
  res.json(result.rows);
});

// IMPORTANTE: nunca ativar a subscrição só porque o utilizador diz que pagou.
// Este endpoint é de uso administrativo (confirmação manual contra o extrato do FacilPay),
// ou para ser chamado por um futuro webhook oficial do FacilPay, se/quando existir.
router.post("/:id/confirm", requireAdminKey, async (req, res) => {
  const sub = await query("SELECT * FROM subscriptions WHERE subscription_id = $1", [req.params.id]);
  if (sub.rows.length === 0) return res.status(404).json({ error: "Subscrição não encontrada." });
  const subscription = sub.rows[0];

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  await query(
    "UPDATE subscriptions SET payment_status = 'confirmado', started_at = $1, expires_at = $2 WHERE subscription_id = $3",
    [startedAt, expiresAt, subscription.subscription_id]
  );
  await query("UPDATE users SET subscription_status = 'ativo' WHERE user_id = $1", [subscription.user_id]);

  try {
    const u = await query("SELECT phone_number FROM users WHERE user_id = $1", [subscription.user_id]);
    await sendNotificationSms(u.rows[0]?.phone_number, "O teu pagamento da consultoria foi confirmado. A tua subscricao esta ativa.");
  } catch (e) {
    console.error("Falha ao notificar utilizador:", e.message);
  }

  res.json({ status: "confirmado", expires_at: expiresAt });
});

// Placeholder para um futuro webhook oficial do FacilPay — a validar a assinatura
// da chamada antes de confiar em qualquer payload, quando essa integração existir.
router.post("/webhook", async (req, res) => {
  res.status(501).json({ error: "Webhook do FacilPay ainda não integrado. Usa /subscriptions/:id/confirm com a chave administrativa." });
});

export default router;
