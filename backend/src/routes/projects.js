import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await query(
    "SELECT project_id, name, category, objective, status, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC",
    [req.userId]
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, category } = req.body;

  if (category === "curso_marketing") {
    const sub = await query(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND payment_status = 'confirmado' AND plan_name = 'premium'
       ORDER BY expires_at DESC LIMIT 1`,
      [req.userId]
    );
    const active = sub.rows[0] && new Date(sub.rows[0].expires_at) > new Date();
    if (!active) {
      return res.status(402).json({ error: "O curso de marketing digital é exclusivo do plano Premium." });
    }
  }

  const result = await query(
    "INSERT INTO projects (user_id, name, category) VALUES ($1, $2, $3) RETURNING *",
    [req.userId, name || "Novo projeto", category || null]
  );
  const project = result.rows[0];
  await query("INSERT INTO project_memory (project_id) VALUES ($1)", [project.project_id]);
  res.status(201).json(project);
});

router.get("/:id", async (req, res) => {
  const project = await query("SELECT * FROM projects WHERE project_id = $1 AND user_id = $2", [req.params.id, req.userId]);
  if (project.rows.length === 0) return res.status(404).json({ error: "Projeto não encontrado." });
  const memory = await query("SELECT * FROM project_memory WHERE project_id = $1", [req.params.id]);
  const messages = await query("SELECT role, content, created_at FROM messages WHERE project_id = $1 ORDER BY created_at ASC", [req.params.id]);
  res.json({ project: project.rows[0], memory: memory.rows[0], messages: messages.rows });
});

export default router;
