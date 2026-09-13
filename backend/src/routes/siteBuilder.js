import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";

const router = Router();

// Submissão pública do wizard — não exige login, porque esta funcionalidade
// só é acessível através do link direto/escondido.
router.post("/", async (req, res) => {
  const {
    business_category, business_type, color_scheme,
    structure_choice, style_choice, domain_choice,
    tier, company_name, company_description, contact_info,
  } = req.body;

  if (!company_name || !contact_info) {
    return res.status(400).json({ error: "Nome da empresa e forma de contacto são obrigatórios." });
  }

  const isPro = tier === "pro";
  const amount = isPro ? process.env.PAYMENT_AMOUNT_SITE_PRO : process.env.PAYMENT_AMOUNT_SITE_BASICO;
  const reference = isPro ? process.env.PAYMENT_REFERENCE_SITE_PRO : process.env.PAYMENT_REFERENCE_SITE_BASICO;

  const result = await query(
    `INSERT INTO site_builds
      (business_category, business_type, color_scheme, structure_choice, style_choice,
       domain_choice, tier, company_name, company_description, contact_info,
       amount, currency, payment_reference, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pendente')
     RETURNING build_id`,
    [
      business_category, business_type, color_scheme, structure_choice, style_choice,
      domain_choice || "blogger", isPro ? "pro" : "basico", company_name, company_description, contact_info,
      amount, process.env.PAYMENT_CURRENCY || "AOA", reference,
    ]
  );

  res.status(201).json({
    build_id: result.rows[0].build_id,
    payment_url: process.env.PAYMENT_URL,
    payment_reference: reference,
    payment_amount: amount,
    payment_currency: process.env.PAYMENT_CURRENCY || "AOA",
  });
});

// Estado de uma construção específica — usado pela página pública para saber
// se já pode desbloquear o download.
router.get("/:id/status", async (req, res) => {
  const result = await query("SELECT payment_status, tier FROM site_builds WHERE build_id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });
  res.json(result.rows[0]);
});

// Lista pendentes — alimenta o painel administrativo.
router.get("/admin/pending", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT build_id, company_name, contact_info, tier, amount, currency, payment_reference, created_at
     FROM site_builds WHERE payment_status = 'pendente' ORDER BY created_at ASC`
  );
  res.json(result.rows);
});

// Confirmação manual — o mesmo princípio das subscrições: só confirmar depois
// de verificar a transferência real no extrato FaciPay.
router.post("/:id/confirm", requireAdminKey, async (req, res) => {
  const result = await query(
    `UPDATE site_builds SET payment_status = 'confirmado', confirmed_at = now()
     WHERE build_id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });
  res.json({ status: "confirmado" });
});

export default router;
