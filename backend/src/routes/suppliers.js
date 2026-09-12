import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { findSuppliers } from "../ai/supplierSearch.js";
import { checkSupplierSearchLimit, logSupplierSearch } from "../ai/supplierLimit.js";
import { query } from "../db.js";

const router = Router();
router.use(requireAuth);

router.post("/:projectId/suppliers", async (req, res) => {
  const project = await query("SELECT * FROM projects WHERE project_id = $1 AND user_id = $2", [req.params.projectId, req.userId]);
  if (project.rows.length === 0) return res.status(404).json({ error: "Projeto não encontrado." });

  const limitCheck = await checkSupplierSearchLimit(req.userId);
  if (!limitCheck.allowed) {
    return res.status(402).json({
      error: `Atingiste o limite de ${limitCheck.limit} pesquisas de fornecedores esta semana no plano gratuito/normal. Ativa o Premium para pesquisas ilimitadas.`,
      upgrade_required: true,
    });
  }

  const memoryResult = await query("SELECT confirmed_facts, user_estimates FROM project_memory WHERE project_id = $1", [req.params.projectId]);
  const memory = { ...memoryResult.rows[0]?.confirmed_facts, ...memoryResult.rows[0]?.user_estimates };

  const productName = req.body.query || memory.product_name || memory.objective;
  if (!productName) {
    return res.status(400).json({ error: "Ainda não sei que produto procurar — descreve primeiro o que queres comprar ou vender." });
  }

  console.log("[DEBUG suppliers] productName length:", productName?.length, "| location:", JSON.stringify(memory.location)?.slice(0, 200));
  const isImport = project.rows[0].category === "importacao";
  if (!isImport && !memory.location) {
    return res.status(400).json({
      error: "Preciso saber onde estás para procurar fornecedores locais — diz-me o bairro, cidade e/ou país.",
      needs_location: true,
    });
  }

  try {
    const result = await findSuppliers({ productName, location: memory.location, isImport, notes: req.body.notes });
    await query("INSERT INTO messages (project_id, role, content) VALUES ($1, 'assistant', $2)", [req.params.projectId, result.content]);
    await logSupplierSearch(req.userId);
    res.json({ ...result, searches_remaining: limitCheck.isPremium ? null : limitCheck.remaining - 1 });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

export default router;
