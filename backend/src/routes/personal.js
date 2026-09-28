import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";

const router = Router();

const NIVEIS = [
  { nivel: 1, nome: "Fundação", refeicoes: 0.5, treinos: 0.5 },
  { nivel: 2, nome: "Disciplina", refeicoes: 0.7, treinos: 0.7 },
  { nivel: 3, nome: "Consistência", refeicoes: 0.85, treinos: 0.85, metasMinimas: 1 },
  { nivel: 4, nome: "Crescimento", refeicoes: 0.9, treinos: 0.9, metasMinimas: 2 },
  { nivel: 5, nome: "Visionário", refeicoes: 0.9, treinos: 0.9, metasMinimas: 2 },
];

// Calcula em que "area" do estagio (blocos de 2 semanas) o dono esta, a partir da data de inicio.
function calcularAreaEstagio(dataInicio) {
  if (!dataInicio) return null;
  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const diasPassados = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
  if (diasPassados < 0) return { area: 0, diasPassados: 0, estagioComecou: false };
  const area = Math.floor(diasPassados / 14) + 1;
  return { area, diasPassados, estagioComecou: true };
}

// --- Configuracao (chave/valor simples, ex: data de inicio do estagio) ---
router.get("/config", requireAdminKey, async (req, res) => {
  const result = await query("SELECT key, value FROM personal_config");
  const obj = {};
  for (const r of result.rows) obj[r.key] = r.value;
  res.json(obj);
});

router.post("/config", requireAdminKey, async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "key em falta." });
  await query(
    "INSERT INTO personal_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
    [key, value]
  );
  res.json({ status: "ok" });
});

// --- Dividas ---
router.get("/debts", requireAdminKey, async (req, res) => {
  const result = await query("SELECT * FROM personal_debts ORDER BY due_date ASC NULLS LAST, created_at ASC");
  res.json(result.rows);
});

router.post("/debts", requireAdminKey, async (req, res) => {
  const { description, amount, due_date, recurring, recurring_day } = req.body;
  const result = await query(
    "INSERT INTO personal_debts (description, amount, due_date, recurring, recurring_day) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [description, amount, due_date || null, !!recurring, recurring_day ?? null]
  );
  res.status(201).json(result.rows[0]);
});

router.post("/debts/:id/pay", requireAdminKey, async (req, res) => {
  await query("UPDATE personal_debts SET status = 'pago' WHERE debt_id = $1", [req.params.id]);
  res.json({ status: "pago" });
});

// --- Metas de poupanca ---
router.get("/goals", requireAdminKey, async (req, res) => {
  const result = await query("SELECT * FROM personal_savings_goals ORDER BY priority ASC, due_date ASC NULLS LAST");
  res.json(result.rows);
});

router.post("/goals", requireAdminKey, async (req, res) => {
  const { title, target_amount, due_date, priority } = req.body;
  const result = await query(
    "INSERT INTO personal_savings_goals (title, target_amount, due_date, priority) VALUES ($1,$2,$3,$4) RETURNING *",
    [title, target_amount, due_date || null, priority ?? 5]
  );
  res.status(201).json(result.rows[0]);
});

router.post("/goals/:id/progress", requireAdminKey, async (req, res) => {
  const { amount } = req.body;
  const result = await query(
    "UPDATE personal_savings_goals SET current_amount = current_amount + $1 WHERE goal_id = $2 RETURNING *",
    [amount, req.params.id]
  );
  const goal = result.rows[0];
  if (goal && parseFloat(goal.current_amount) >= parseFloat(goal.target_amount) && goal.status !== "concluida") {
    await query("UPDATE personal_savings_goals SET status = 'concluida' WHERE goal_id = $1", [goal.goal_id]);
  }
  res.json(goal);
});

// --- Log diario (refeicoes, treino, peso) ---
router.post("/log", requireAdminKey, async (req, res) => {
  const { log_date, meals_planned, meals_completed, workout_done, weight_kg, notes } = req.body;
  const result = await query(
    `INSERT INTO personal_daily_log (log_date, meals_planned, meals_completed, workout_done, weight_kg, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (log_date) DO UPDATE SET
       meals_planned = $2, meals_completed = $3, workout_done = $4, weight_kg = $5, notes = $6
     RETURNING *`,
    [log_date, meals_planned || 0, meals_completed || 0, !!workout_done, weight_kg || null, notes || null]
  );
  res.json(result.rows[0]);
});

router.get("/log", requireAdminKey, async (req, res) => {
  const dias = Math.min(parseInt(req.query.dias, 10) || 30, 365);
  const result = await query(
    `SELECT * FROM personal_daily_log WHERE log_date >= CURRENT_DATE - $1::int ORDER BY log_date ASC`,
    [dias]
  );
  res.json(result.rows);
});

// --- Despesas ---
router.get("/expenses", requireAdminKey, async (req, res) => {
  const dias = Math.min(parseInt(req.query.dias, 10) || 30, 365);
  const result = await query(
    `SELECT * FROM personal_expenses WHERE expense_date >= CURRENT_DATE - $1::int ORDER BY expense_date DESC`,
    [dias]
  );
  res.json(result.rows);
});

router.post("/expenses", requireAdminKey, async (req, res) => {
  const { category, description, amount, expense_date } = req.body;
  const result = await query(
    "INSERT INTO personal_expenses (category, description, amount, expense_date) VALUES ($1,$2,$3,$4) RETURNING *",
    [category, description || null, amount, expense_date || new Date()]
  );
  res.status(201).json(result.rows[0]);
});

// --- Missoes / agenda ---
router.get("/missions", requireAdminKey, async (req, res) => {
  const result = await query("SELECT * FROM personal_missions WHERE status = 'pendente' ORDER BY due_date ASC NULLS LAST");
  res.json(result.rows);
});

router.post("/missions", requireAdminKey, async (req, res) => {
  const { title, description, due_date, type, related_id } = req.body;
  const result = await query(
    "INSERT INTO personal_missions (title, description, due_date, type, related_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, description || null, due_date || null, type || "outro", related_id || null]
  );
  res.status(201).json(result.rows[0]);
});

router.post("/missions/:id/complete", requireAdminKey, async (req, res) => {
  await query("UPDATE personal_missions SET status = 'concluida' WHERE mission_id = $1", [req.params.id]);
  res.json({ status: "concluida" });
});

// --- Resumo geral: nivel actual, area do estagio, totais ---
router.get("/summary", requireAdminKey, async (req, res) => {
  const config = await query("SELECT key, value FROM personal_config");
  const cfg = {};
  for (const r of config.rows) cfg[r.key] = r.value;

  const area = calcularAreaEstagio(cfg.estagio_inicio);

  // Janela da area actual (2 semanas), ou os ultimos 14 dias se o estagio nao tiver data definida.
  const inicioJanela = area && area.estagioComecou
    ? new Date(new Date(cfg.estagio_inicio).getTime() + (area.area - 1) * 14 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const logResult = await query(
    "SELECT * FROM personal_daily_log WHERE log_date >= $1",
    [inicioJanela.toISOString().slice(0, 10)]
  );
  const logs = logResult.rows;
  const totalPlaneadas = logs.reduce((s, l) => s + (l.meals_planned || 0), 0);
  const totalCumpridas = logs.reduce((s, l) => s + (l.meals_completed || 0), 0);
  const treinosFeitos = logs.filter((l) => l.workout_done).length;
  const diasNaJanela = logs.length || 1;

  const pctRefeicoes = totalPlaneadas > 0 ? totalCumpridas / totalPlaneadas : 0;
  const pctTreinos = treinosFeitos / diasNaJanela;

  const metasConcluidas = await query("SELECT COUNT(*) AS c FROM personal_savings_goals WHERE status = 'concluida'");
  const numMetasConcluidas = parseInt(metasConcluidas.rows[0].c, 10);

  let nivelActual = NIVEIS[0];
  for (const n of NIVEIS) {
    const cumpreMetas = !n.metasMinimas || numMetasConcluidas >= n.metasMinimas;
    if (pctRefeicoes >= n.refeicoes && pctTreinos >= n.treinos && cumpreMetas) {
      nivelActual = n;
    }
  }

  const dividasPendentes = await query("SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS c FROM personal_debts WHERE status = 'pendente'");
  const despesasMes = await query("SELECT COALESCE(SUM(amount),0) AS total FROM personal_expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)");

  res.json({
    nivel: nivelActual,
    progresso: {
      pct_refeicoes: Math.round(pctRefeicoes * 100),
      pct_treinos: Math.round(pctTreinos * 100),
      metas_concluidas: numMetasConcluidas,
    },
    estagio: area,
    dividas_pendentes: { total: parseFloat(dividasPendentes.rows[0].total), count: parseInt(dividasPendentes.rows[0].c, 10) },
    despesas_mes: parseFloat(despesasMes.rows[0].total),
  });
});

export default router;
