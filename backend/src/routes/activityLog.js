import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";

const router = Router();

// Regista um evento no activity_log — chamada internamente por outras rotas
// (ex: subscriptions.js apos confirmar pagamento), nao e uma rota HTTP.
export async function logEvent(userId, eventType, details = {}) {
  await query(
    "INSERT INTO activity_log (user_id, event_type, details) VALUES ($1, $2, $3)",
    [userId || null, eventType, JSON.stringify(details)]
  );
}

// Lista de eventos - alimenta a seccao "Registo em sistema informativo" do painel.
router.get("/", requireAdminKey, async (req, res) => {
  const { event_type, user_id, limit } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (event_type) {
    conditions.push(`event_type = $${idx++}`);
    params.push(event_type);
  }
  if (user_id) {
    conditions.push(`user_id = $${idx++}`);
    params.push(user_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const max = Math.min(parseInt(limit, 10) || 100, 500);

  const result = await query(
    `SELECT log_id, user_id, event_type, details, created_at
     FROM activity_log
     ${where}
     ORDER BY created_at DESC
     LIMIT ${max}`,
    params
  );
  res.json(result.rows);
});

export default router;
