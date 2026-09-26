import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdminKey } from "../middleware/auth.js";
import { logEvent } from "./activityLog.js";

const router = Router();

const SERVICE_TYPES = ["construtor", "consultoria", "curso", "afiliado"];

// Cria uma avaliacao — pedida ao utilizador apos compra, mas nunca bloqueante.
router.post("/", requireAuth, async (req, res) => {
  const { service_type, reference_id, rating, comment } = req.body;

  if (!SERVICE_TYPES.includes(service_type)) {
    return res.status(400).json({ error: `service_type tem de ser um de: ${SERVICE_TYPES.join(", ")}` });
  }
  const ratingNum = parseInt(rating, 10);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "rating tem de ser um numero entre 1 e 5." });
  }

  const result = await query(
    `INSERT INTO reviews (user_id, service_type, reference_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, service_type, reference_id || null, ratingNum, comment || null]
  );

  await logEvent(req.userId, "avaliacao_criada", { service_type, rating: ratingNum });

  res.status(201).json(result.rows[0]);
});

// Lista avaliacoes, filtravel por servico — alimenta o painel.
router.get("/", requireAdminKey, async (req, res) => {
  const { service_type, min_rating, limit } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (service_type) {
    conditions.push(`service_type = $${idx++}`);
    params.push(service_type);
  }
  if (min_rating) {
    conditions.push(`rating >= $${idx++}`);
    params.push(parseInt(min_rating, 10));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const max = Math.min(parseInt(limit, 10) || 100, 500);

  const result = await query(
    `SELECT r.review_id, r.user_id, u.phone_number, r.service_type, r.reference_id,
            r.rating, r.comment, r.created_at
     FROM reviews r JOIN users u ON u.user_id = r.user_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ${max}`,
    params
  );
  res.json(result.rows);
});

// Media geral + distribuicao (1 a 5 estrelas) por servico — para os graficos/KPI de qualidade.
router.get("/summary", requireAdminKey, async (req, res) => {
  const { service_type } = req.query;
  const where = service_type ? "WHERE service_type = $1" : "";
  const params = service_type ? [service_type] : [];

  const avgResult = await query(
    `SELECT COUNT(*) AS total, ROUND(AVG(rating)::numeric, 2) AS average
     FROM reviews ${where}`,
    params
  );
  const distResult = await query(
    `SELECT rating, COUNT(*) AS count FROM reviews ${where} GROUP BY rating ORDER BY rating`,
    params
  );

  res.json({
    total: parseInt(avgResult.rows[0].total, 10),
    average: avgResult.rows[0].average ? parseFloat(avgResult.rows[0].average) : null,
    distribution: distResult.rows.map(r => ({ rating: r.rating, count: parseInt(r.count, 10) })),
  });
});

export default router;
