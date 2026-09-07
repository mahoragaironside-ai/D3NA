import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { interpretTurn } from "../ai/orchestrator.js";
import { mergeMemory, splitMemoryForStorage } from "../engine/memoryEngine.js";
import { runDecisionEngine } from "../engine/decisionEngine.js";

const router = Router();
router.use(requireAuth);

const FREE_ANALYSES_PER_MONTH = 1;

router.post("/:projectId/messages", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Mensagem vazia." });

  const projectResult = await query("SELECT * FROM projects WHERE project_id = $1 AND user_id = $2", [req.params.projectId, req.userId]);
  const project = projectResult.rows[0];
  if (!project) return res.status(404).json({ error: "Projeto não encontrado." });

  const subResult = await query(
    `SELECT * FROM subscriptions WHERE user_id = $1 AND payment_status = 'confirmado'
     ORDER BY expires_at DESC LIMIT 1`,
    [req.userId]
  );
  const activeSub = subResult.rows[0];
  const subscriptionActive = activeSub && new Date(activeSub.expires_at) > new Date();
  if (!subscriptionActive) {
    await query("UPDATE users SET subscription_status = 'expirado' WHERE user_id = $1 AND subscription_status = 'ativo'", [req.userId]);
  }

  if (!subscriptionActive) {
    const usage = await query(
      `SELECT count(*) FROM analyses a JOIN projects p ON p.project_id = a.project_id
       WHERE p.user_id = $1 AND a.created_at > date_trunc('month', now())`,
      [req.userId]
    );
    if (Number(usage.rows[0].count) >= FREE_ANALYSES_PER_MONTH) {
      const userRow = await query("SELECT ad_credits FROM users WHERE user_id = $1", [req.userId]);
      const adCredits = userRow.rows[0]?.ad_credits || 0;
      if (adCredits > 0) {
        await query("UPDATE users SET ad_credits = ad_credits - 1 WHERE user_id = $1", [req.userId]);
      } else {
        return res.status(402).json({
          error: "Limite do plano gratuito atingido este mês.",
          upgrade_required: true,
          ads_available: true,
        });
      }
    }
  }

  const memoryResult = await query("SELECT * FROM project_memory WHERE project_id = $1", [project.project_id]);
  const memoryRow = memoryResult.rows[0];
  const memoryWithStatus = {};
  for (const [k, v] of Object.entries(memoryRow.confirmed_facts || {})) memoryWithStatus[k] = { value: v, status: "confirmado" };
  for (const [k, v] of Object.entries(memoryRow.user_estimates || {})) memoryWithStatus[k] = { value: v, status: "estimado" };

  const historyResult = await query("SELECT role, content FROM messages WHERE project_id = $1 ORDER BY created_at ASC", [project.project_id]);

  await query("INSERT INTO messages (project_id, role, content) VALUES ($1, 'user', $2)", [project.project_id, text]);

  let interpretation;
  try {
    interpretation = await interpretTurn({
      userText: text,
      memory: memoryWithStatus,
      category: project.category,
      history: historyResult.rows,
    });
  } catch (e) {
    return res.status(502).json({ error: "Falha ao contactar o motor de interpretação.", detail: e.message });
  }

  const nextCategory = interpretation.category || project.category;
  const nextMemory = mergeMemory(memoryWithStatus, interpretation.updates || {});
  const { confirmed_facts, user_estimates } = splitMemoryForStorage(nextMemory);

  await query("UPDATE projects SET category = $1, updated_at = now() WHERE project_id = $2", [nextCategory, project.project_id]);
  await query(
    "UPDATE project_memory SET confirmed_facts = $1, user_estimates = $2, updated_at = now() WHERE project_id = $3",
    [confirmed_facts, user_estimates, project.project_id]
  );
  await query("INSERT INTO messages (project_id, role, content) VALUES ($1, 'assistant', $2)", [project.project_id, interpretation.reply || ""]);

  let report = null;
  const decision = runDecisionEngine(nextMemory, nextCategory);
  if (decision) {
    report = decision;
    await query(
      "INSERT INTO analyses (project_id, decision_type, status, report) VALUES ($1, $2, $3, $4)",
      [project.project_id, nextCategory, "completo", JSON.stringify(decision)]
    );
  }

  res.json({
    reply: interpretation.reply,
    category: nextCategory,
    memory: nextMemory,
    report,
  });
});

export default router;
