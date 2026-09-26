import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdminKey } from "../middleware/auth.js";
import { logEvent } from "./activityLog.js";
import { sendNotificationSms } from "../services/notifications.js";

const router = Router();

// Cria um pedido de inscricao pendente e devolve o link de pagamento.
router.post("/create", requireAuth, async (req, res) => {
  const courseName = req.body.course_name || process.env.COURSE_NAME || "curso";
  const reference = process.env.COURSE_PAYMENT_REFERENCE;
  const amount = process.env.COURSE_PAYMENT_AMOUNT;

  if (!reference) {
    return res.status(400).json({ error: "O pagamento do curso ainda nao esta configurado (falta COURSE_PAYMENT_REFERENCE)." });
  }

  const result = await query(
    `INSERT INTO course_enrollments (user_id, course_name, payment_reference, amount, currency, payment_status)
     VALUES ($1, $2, $3, $4, $5, 'pendente') RETURNING *`,
    [req.userId, courseName, reference, amount, process.env.PAYMENT_CURRENCY]
  );

  res.status(201).json({
    enrollment: result.rows[0],
    payment_url: process.env.COURSE_PAYMENT_URL,
    payment_reference: reference,
    payment_amount: amount,
    payment_currency: process.env.PAYMENT_CURRENCY,
  });
});

// Estado da inscricao do utilizador autenticado.
router.get("/status", requireAuth, async (req, res) => {
  const latest = await query(
    `SELECT * FROM course_enrollments WHERE user_id = $1 AND payment_status = 'confirmado'
     ORDER BY expires_at DESC LIMIT 1`,
    [req.userId]
  );
  const activeEnrollment = latest.rows[0];
  const isActive = activeEnrollment && new Date(activeEnrollment.expires_at) > new Date();
  res.json({
    enrollment_status: isActive ? "ativo" : "inativo",
    latest: activeEnrollment || null,
  });
});

// Lista inscricoes pendentes de confirmacao — alimenta o painel administrativo.
router.get("/pending", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT c.enrollment_id, c.course_name, c.amount, c.currency, c.payment_reference,
            c.payment_status, c.created_at, u.phone_number
     FROM course_enrollments c JOIN users u ON u.user_id = c.user_id
     WHERE c.payment_status = 'pendente'
     ORDER BY c.created_at ASC`
  );
  res.json(result.rows);
});

// IMPORTANTE: nunca ativar a inscricao so porque o utilizador diz que pagou.
// Uso administrativo (confirmacao manual contra o extrato do FacilPay).
router.post("/:id/confirm", requireAdminKey, async (req, res) => {
  const enr = await query("SELECT * FROM course_enrollments WHERE enrollment_id = $1", [req.params.id]);
  if (enr.rows.length === 0) return res.status(404).json({ error: "Inscricao nao encontrada." });
  const enrollment = enr.rows[0];

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  await query(
    "UPDATE course_enrollments SET payment_status = 'confirmado', started_at = $1, expires_at = $2 WHERE enrollment_id = $3",
    [startedAt, expiresAt, enrollment.enrollment_id]
  );

  await logEvent(enrollment.user_id, "inscricao_curso_confirmada", { enrollment_id: enrollment.enrollment_id, course_name: enrollment.course_name });

  try {
    const u = await query("SELECT phone_number FROM users WHERE user_id = $1", [enrollment.user_id]);
    await sendNotificationSms(u.rows[0]?.phone_number, "O teu pagamento do curso foi confirmado. A tua inscricao esta ativa.");
  } catch (e) {
    console.error("Falha ao notificar utilizador:", e.message);
  }

  res.json({ status: "confirmado", expires_at: expiresAt });
});

export default router;
