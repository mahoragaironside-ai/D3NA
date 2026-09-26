import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";

const router = Router();

// Receita confirmada por periodo, somando os 3 servicos — para o grafico "receita ao longo do tempo".
router.get("/revenue", requireAdminKey, async (req, res) => {
  const bucket = ["minuto", "hora", "dia", "mes", "ano"].includes(req.query.bucket) ? req.query.bucket : "dia";
  const truncMap = { minuto: "minute", hora: "hour", dia: "day", mes: "month", ano: "year" };
  const trunc = truncMap[bucket];

  const result = await query(
    `SELECT date_trunc($1, periodo) AS periodo, SUM(valor) AS total
     FROM (
       SELECT amount AS valor, started_at AS periodo FROM subscriptions WHERE payment_status = 'confirmado'
       UNION ALL
       SELECT amount, confirmed_at FROM site_builds WHERE payment_status = 'confirmado'
       UNION ALL
       SELECT amount, started_at FROM course_enrollments WHERE payment_status = 'confirmado'
     ) t
     WHERE periodo IS NOT NULL
     GROUP BY periodo
     ORDER BY periodo ASC`,
    [trunc]
  );
  res.json(result.rows.map(r => ({ periodo: r.periodo, total: parseFloat(r.total) })));
});

// Novos utilizadores ao longo do tempo — para o segundo grafico.
router.get("/new-users", requireAdminKey, async (req, res) => {
  const bucket = ["minuto", "hora", "dia", "mes", "ano"].includes(req.query.bucket) ? req.query.bucket : "dia";
  const truncMap = { minuto: "minute", hora: "hour", dia: "day", mes: "month", ano: "year" };
  const trunc = truncMap[bucket];

  const result = await query(
    `SELECT date_trunc($1, created_at) AS periodo, COUNT(*) AS total
     FROM users
     GROUP BY periodo
     ORDER BY periodo ASC`,
    [trunc]
  );
  res.json(result.rows.map(r => ({ periodo: r.periodo, total: parseInt(r.total, 10) })));
});

// Resumo rapido para o topo do dashboard: lucro total do periodo pedido + contagens de pendentes.
router.get("/summary", requireAdminKey, async (req, res) => {
  const [revenue, pendingSubs, pendingSites, pendingCourses, users] = await Promise.all([
    query(`SELECT COALESCE(SUM(valor), 0) AS total FROM (
      SELECT amount AS valor FROM subscriptions WHERE payment_status = 'confirmado'
      UNION ALL SELECT amount FROM site_builds WHERE payment_status = 'confirmado'
      UNION ALL SELECT amount FROM course_enrollments WHERE payment_status = 'confirmado'
    ) t`),
    query(`SELECT COUNT(*) AS c FROM subscriptions WHERE payment_status = 'pendente'`),
    query(`SELECT COUNT(*) AS c FROM site_builds WHERE payment_status = 'pendente'`),
    query(`SELECT COUNT(*) AS c FROM course_enrollments WHERE payment_status = 'pendente'`),
    query(`SELECT COUNT(*) AS c FROM users`),
  ]);
  res.json({
    receita_total: parseFloat(revenue.rows[0].total),
    pendentes: {
      subscricoes: parseInt(pendingSubs.rows[0].c, 10),
      sites: parseInt(pendingSites.rows[0].c, 10),
      curso: parseInt(pendingCourses.rows[0].c, 10),
    },
    total_utilizadores: parseInt(users.rows[0].c, 10),
  });
});

// Lista de utilizadores com filtros — secao "Utilizadores" do menu.
router.get("/users", requireAdminKey, async (req, res) => {
  const { active_only, limit } = req.query;
  const where = active_only === "true" ? "WHERE subscription_status = 'ativo'" : "";
  const max = Math.min(parseInt(limit, 10) || 100, 500);

  const result = await query(
    `SELECT user_id, phone_number, phone_verified, subscription_status, ad_views_count, ad_credits, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ${max}`
  );
  res.json(result.rows);
});

export default router;
