import { Router } from "express";
import crypto from "node:crypto";
import { query } from "../db.js";
import { requireAuth, requireAdminKey } from "../middleware/auth.js";
import { runWeeklyPassiveIncome } from "../lib/affiliateCommissions.js";

const router = Router();

const AOA_USD_RATE = Number(process.env.AOA_USD_RATE) || 830; // taxa aproximada, ajustar no .env
const MIN_WITHDRAWAL_USD = 5;

function generateReferralCode() {
  return crypto.randomBytes(5).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}
function toUsd(amountAoa) {
  return Math.round((Number(amountAoa) / AOA_USD_RATE) * 100) / 100;
}

router.post("/register", requireAuth, async (req, res) => {
  const existing = await query("SELECT * FROM affiliates WHERE user_id = $1", [req.userId]);
  if (existing.rows.length > 0) return res.status(409).json({ error: "Já és afiliado.", affiliate: existing.rows[0] });

  let code, inserted;
  for (let tentativa = 0; tentativa < 5 && !inserted; tentativa++) {
    code = generateReferralCode();
    try {
      const result = await query("INSERT INTO affiliates (user_id, referral_code) VALUES ($1, $2) RETURNING *", [req.userId, code]);
      inserted = result.rows[0];
    } catch (e) {
      if (e.code !== "23505") throw e;
    }
  }
  if (!inserted) return res.status(500).json({ error: "Não foi possível gerar um código único. Tenta novamente." });
  res.status(201).json(inserted);
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await query("SELECT * FROM affiliates WHERE user_id = $1", [req.userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const affiliate = result.rows[0];
  res.json({ ...affiliate, balance_usd: toUsd(affiliate.balance_aoa), aoa_usd_rate: AOA_USD_RATE });
});

router.get("/me/referrals", requireAuth, async (req, res) => {
  const aff = await query("SELECT affiliate_id FROM affiliates WHERE user_id = $1", [req.userId]);
  if (aff.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const result = await query(
    "SELECT user_id, phone_number, subscription_status, created_at FROM users WHERE referred_by_affiliate_id = $1 ORDER BY created_at DESC",
    [aff.rows[0].affiliate_id]
  );
  res.json(result.rows);
});

router.get("/me/commissions", requireAuth, async (req, res) => {
  const aff = await query("SELECT affiliate_id FROM affiliates WHERE user_id = $1", [req.userId]);
  if (aff.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const result = await query(
    "SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC LIMIT 100",
    [aff.rows[0].affiliate_id]
  );
  res.json(result.rows);
});

router.get("/rules", (req, res) => {
  res.json({
    registo_sem_plano: { valor_aoa: 5, descricao: "Renda mínima semanal por conta registada com o teu link, sem plano. (job semanal a implementar)" },
    consultoria_semanal: { valor_aoa: 200, descricao: "Plano Básico de Consultoria, por cada renovação semanal." },
    premium: { valor_aoa: 500, descricao: "Plano Premium de Consultoria, por cada renovação semanal." },
    construtor: { valor_aoa: 600, descricao: "Venda normal do link do Construtor de Sites." },
    aoa_usd_rate: AOA_USD_RATE,
    saque_minimo_usd: MIN_WITHDRAWAL_USD,
  });
});

router.post("/me/redotpay", requireAuth, async (req, res) => {
  const redotpay_id = String(req.body.redotpay_id || "").trim();
  if (!redotpay_id) return res.status(400).json({ error: "Indica o ID da tua conta RedotPay." });
  const result = await query("UPDATE affiliates SET redotpay_id = $1 WHERE user_id = $2 RETURNING *", [redotpay_id, req.userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  res.json(result.rows[0]);
});

router.post("/withdraw", requireAuth, async (req, res) => {
  const aff = await query("SELECT * FROM affiliates WHERE user_id = $1", [req.userId]);
  if (aff.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const affiliate = aff.rows[0];

  if (!affiliate.redotpay_id) return res.status(400).json({ error: "Precisas de indicar o ID da tua conta RedotPay antes de sacar." });
  if (toUsd(affiliate.balance_aoa) < MIN_WITHDRAWAL_USD) return res.status(400).json({ error: `Saldo mínimo para saque: ${MIN_WITHDRAWAL_USD} USD.` });

  const withdrawal = await query(
    "INSERT INTO affiliate_withdrawals (affiliate_id, amount_aoa, redotpay_id) VALUES ($1, $2, $3) RETURNING *",
    [affiliate.affiliate_id, affiliate.balance_aoa, affiliate.redotpay_id]
  );
  await query("UPDATE affiliates SET balance_aoa = 0 WHERE affiliate_id = $1", [affiliate.affiliate_id]);
  res.status(201).json(withdrawal.rows[0]);
});

router.get("/admin/list", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT a.*, u.phone_number,
            (SELECT COUNT(*) FROM users WHERE referred_by_affiliate_id = a.affiliate_id) AS total_referidos
     FROM affiliates a JOIN users u ON u.user_id = a.user_id ORDER BY a.created_at DESC`
  );
  res.json(result.rows);
});

router.get("/admin/:affiliateId", requireAdminKey, async (req, res) => {
  const aff = await query(
    "SELECT a.*, u.phone_number FROM affiliates a JOIN users u ON u.user_id = a.user_id WHERE a.affiliate_id = $1",
    [req.params.affiliateId]
  );
  if (aff.rows.length === 0) return res.status(404).json({ error: "Afiliado não encontrado." });
  const referrals = await query(
    "SELECT user_id, phone_number, subscription_status, created_at FROM users WHERE referred_by_affiliate_id = $1 ORDER BY created_at DESC",
    [req.params.affiliateId]
  );
  const commissions = await query(
    "SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC LIMIT 200",
    [req.params.affiliateId]
  );
  const withdrawals = await query(
    "SELECT * FROM affiliate_withdrawals WHERE affiliate_id = $1 ORDER BY created_at DESC",
    [req.params.affiliateId]
  );
  res.json({ affiliate: aff.rows[0], referrals: referrals.rows, commissions: commissions.rows, withdrawals: withdrawals.rows });
});

router.get("/admin/withdrawals/pending", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT w.*, a.referral_code, u.phone_number
     FROM affiliate_withdrawals w
     JOIN affiliates a ON a.affiliate_id = w.affiliate_id
     JOIN users u ON u.user_id = a.user_id
     WHERE w.status = 'pendente' ORDER BY w.created_at ASC`
  );
  res.json(result.rows);
});

router.post("/admin/withdrawals/:id/confirm", requireAdminKey, async (req, res) => {
  const result = await query(
    "UPDATE affiliate_withdrawals SET status = 'pago', paid_at = now() WHERE withdrawal_id = $1 AND status = 'pendente' RETURNING *",
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Saque não encontrado ou já processado." });
  res.json(result.rows[0]);
});

router.post("/admin/withdrawals/:id/reject", requireAdminKey, async (req, res) => {
  const w = await query("SELECT * FROM affiliate_withdrawals WHERE withdrawal_id = $1 AND status = 'pendente'", [req.params.id]);
  if (w.rows.length === 0) return res.status(404).json({ error: "Saque não encontrado ou já processado." });
  const withdrawal = w.rows[0];
  await query("UPDATE affiliate_withdrawals SET status = 'rejeitado' WHERE withdrawal_id = $1", [withdrawal.withdrawal_id]);
  await query("UPDATE affiliates SET balance_aoa = balance_aoa + $1 WHERE affiliate_id = $2", [withdrawal.amount_aoa, withdrawal.affiliate_id]);
  res.json({ status: "rejeitado" });
});

router.post("/admin/weekly-payout", requireAdminKey, async (req, res) => {
  const pagos = await runWeeklyPassiveIncome();
  res.json({ afiliados_pagos: pagos.length, detalhe: pagos });
});


router.get("/me/notifications", requireAuth, async (req, res) => {
  const aff = await query("SELECT affiliate_id FROM affiliates WHERE user_id = $1", [req.userId]);
  if (aff.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const result = await query(
    `SELECT * FROM affiliate_notifications
     WHERE affiliate_id = $1 OR affiliate_id IS NULL
     ORDER BY created_at DESC LIMIT 50`,
    [aff.rows[0].affiliate_id]
  );
  res.json(result.rows);
});

router.get("/me/notifications/unread-count", requireAuth, async (req, res) => {
  const aff = await query("SELECT affiliate_id, notifications_seen_at FROM affiliates WHERE user_id = $1", [req.userId]);
  if (aff.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  const result = await query(
    `SELECT COUNT(*) FROM affiliate_notifications
     WHERE (affiliate_id = $1 OR affiliate_id IS NULL) AND created_at > $2`,
    [aff.rows[0].affiliate_id, aff.rows[0].notifications_seen_at]
  );
  res.json({ count: Number(result.rows[0].count) });
});

router.post("/me/notifications/seen", requireAuth, async (req, res) => {
  const result = await query(
    "UPDATE affiliates SET notifications_seen_at = now() WHERE user_id = $1 RETURNING notifications_seen_at",
    [req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Ainda não és afiliado." });
  res.json(result.rows[0]);
});

router.post("/admin/notifications", requireAdminKey, async (req, res) => {
  const { title, message, affiliate_id } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Título e mensagem são obrigatórios." });
  const result = await query(
    "INSERT INTO affiliate_notifications (affiliate_id, title, message) VALUES ($1, $2, $3) RETURNING *",
    [affiliate_id || null, title, message]
  );
  res.status(201).json(result.rows[0]);
});

router.get("/admin/notifications", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT n.*, a.referral_code, u.phone_number
     FROM affiliate_notifications n
     LEFT JOIN affiliates a ON a.affiliate_id = n.affiliate_id
     LEFT JOIN users u ON u.user_id = a.user_id
     ORDER BY n.created_at DESC LIMIT 100`
  );
  res.json(result.rows);
});

export default router;
