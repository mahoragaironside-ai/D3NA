import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";
import { sendNotificationSms, extractPhoneFromContactLinks } from "../services/notifications.js";
import { gerarSite } from "../lib/siteGenerator/index.js";
import { awardCommissionDirect } from "../lib/affiliateCommissions.js";
import bcrypt from "bcryptjs";

const router = Router();

// Pré-visualização em tempo real, sem gravar nada nem exigir pagamento —
// usada pelo wizard para mostrar o site real antes de a pessoa decidir pagar.
router.post("/preview", (req, res) => {
  try {
    const contact_links = req.body.contact_links ? JSON.parse(req.body.contact_links || "[]") : [];
    const catalog_items = req.body.catalog_items ? JSON.parse(req.body.catalog_items || "[]") : [];
    const html = gerarSite({ ...req.body, contact_links, catalog_items });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(400).json({ error: "Não foi possível gerar a pré-visualização: " + e.message });
  }
});

// Submissão pública do wizard — não exige login, porque esta funcionalidade
// só é acessível através do link direto/escondido.
router.post("/", async (req, res) => {
  const {
    business_category, business_type, color_scheme,
    structure_choice, style_choice, domain_choice,
    tier, company_name, company_description, contact_info,
    contact_links, logo_choice, catalog_items, gallery_items, font_choice,
    panel_password, referral_code,
  } = req.body;

  if (!company_name || (!contact_links && !contact_info)) {
    return res.status(400).json({ error: "Nome da empresa e pelo menos um contacto são obrigatórios." });
  }

  const isPro = tier === "pro";
  const amount = isPro ? process.env.PAYMENT_AMOUNT_SITE_PRO : process.env.PAYMENT_AMOUNT_SITE_BASICO;
  const reference = isPro ? process.env.PAYMENT_REFERENCE_SITE_PRO : process.env.PAYMENT_REFERENCE_SITE_BASICO;

  // Hash da password do painel — nunca guardamos a password em si, so o hash,
  // exatamente como e feito no login normal (routes/auth.js).
  const panelPasswordHash = panel_password ? await bcrypt.hash(panel_password, 12) : null;
  // Por agora so fica "pendente" quando a D3NA vai publicar por conta do cliente
  // (fluxo ainda por ligar no wizard); nos outros casos fica "nao_aplicavel".
  const publishStatus = domain_choice === "d3na" ? "pendente" : "nao_aplicavel";

  let affiliateId = null;
  if (referral_code) {
    const aff = await query("SELECT affiliate_id FROM affiliates WHERE referral_code = $1", [String(referral_code).trim().toUpperCase()]);
    affiliateId = aff.rows[0]?.affiliate_id || null;
  }

  const result = await query(
    `INSERT INTO site_builds
      (business_category, business_type, color_scheme, structure_choice, style_choice,
       domain_choice, tier, company_name, company_description, contact_info,
       contact_links, logo_choice, catalog_items, gallery_items, font_choice,
       panel_password_hash, publish_status, affiliate_id,
       amount, currency, payment_reference, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'pendente')
     RETURNING build_id`,
    [
      business_category, business_type, color_scheme, structure_choice, style_choice,
      domain_choice || "blogger", isPro ? "pro" : "basico", company_name, company_description, contact_info,
      contact_links || null, logo_choice || null, catalog_items || null, gallery_items || null, font_choice || "sistema",
      panelPasswordHash, publishStatus, affiliateId,
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
  const result = await query("SELECT payment_status, tier, publish_status, site_url FROM site_builds WHERE build_id = $1", [req.params.id]);
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

  try {
    if (result.rows[0].affiliate_id) {
      await awardCommissionDirect(result.rows[0].affiliate_id, "construtor", result.rows[0].build_id);
    }
  } catch (e) {
    console.error("Falha ao atribuir comissao de afiliado (construtor):", e.message);
  }

  try {
    const phone = extractPhoneFromContactLinks(result.rows[0].contact_links);
    await sendNotificationSms(phone, "O pagamento do teu site foi confirmado. Entra em contacto para receberes o ficheiro/acesso final.");
  } catch (e) {
    console.error("Falha ao notificar utilizador:", e.message);
  }

  res.json({ status: "confirmado" });
});

// Lista construções pagas que escolheram "a D3NA publica por mim" e ainda
// aguardam o upload manual no Netlify.
router.get("/admin/pending-publish", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT build_id, company_name, contact_info, tier, created_at, publish_status
     FROM site_builds
     WHERE domain_choice = 'd3na' AND payment_status = 'confirmado'
       AND publish_status IN ('pendente', 'atualizacao_pedida')
     ORDER BY created_at ASC`
  );
  res.json(result.rows);
});

// Marca um site como publicado, depois do dono do D3NA fazer o upload manual
// no Netlify. So funciona se o pagamento ja estiver confirmado.
router.post("/:id/publish", requireAdminKey, async (req, res) => {
  const { site_url } = req.body;
  if (!site_url) return res.status(400).json({ error: "site_url é obrigatório." });

  const result = await query(
    `UPDATE site_builds SET publish_status = 'publicado', site_url = $2
     WHERE build_id = $1 AND payment_status = 'confirmado' RETURNING *`,
    [req.params.id, site_url]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada ou pagamento ainda não confirmado." });

  try {
    const phone = extractPhoneFromContactLinks(result.rows[0].contact_links);
    await sendNotificationSms(phone, `O teu site já está no ar: ${site_url}. Usa a password que criaste no wizard para entrar no painel de controlo.`);
  } catch (e) {
    console.error("Falha ao notificar utilizador:", e.message);
  }

  res.json({ status: "publicado", site_url });
});


// Descarrega o site real — só liberta o ficheiro depois do pagamento confirmado.
// Nunca confia no que o browser diz; verifica sempre o estado guardado na base de dados.
router.get("/:id/download", async (req, res) => {
  const result = await query("SELECT * FROM site_builds WHERE build_id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });

  const site = result.rows[0];
  if (site.payment_status !== "confirmado") {
    return res.status(403).json({ error: "O pagamento ainda não foi confirmado — o ficheiro não está disponível." });
  }

  try {
    const dados = {
      ...site,
      contact_links: site.contact_links ? JSON.parse(site.contact_links) : [],
      catalog_items: site.catalog_items ? JSON.parse(site.catalog_items) : [],
      gallery_items: site.gallery_items ? JSON.parse(site.gallery_items) : [],
    };
    const html = gerarSite(dados);
    const nomeFicheiro = (site.company_name || "site")
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "site";

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeFicheiro}.html"`);
    res.send(html);
  } catch (e) {
    res.status(500).json({ error: "Não foi possível gerar o ficheiro final: " + e.message });
  }
});

// Pedido de atualizacao — o cliente, a partir do painel, avisa que quer que
// a D3NA volte a publicar o site com as alteracoes mais recentes.
router.post("/:id/panel/request-update", async (req, res) => {
  const { password } = req.body;
  const check = await query(
    "SELECT panel_password_hash, domain_choice, publish_status FROM site_builds WHERE build_id = $1",
    [req.params.id]
  );
  if (check.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });

  const site = check.rows[0];
  const ok = site.panel_password_hash && password && (await bcrypt.compare(password, site.panel_password_hash));
  if (!ok) return res.status(401).json({ error: "Password incorreta." });

  if (site.domain_choice !== "d3na") {
    return res.status(400).json({ error: "Esta opção só se aplica a sites publicados pela D3NA." });
  }
  if (site.publish_status !== "publicado") {
    return res.status(400).json({ error: "O site ainda não foi publicado — não há nada para atualizar." });
  }

  await query("UPDATE site_builds SET publish_status = 'atualizacao_pedida' WHERE build_id = $1", [req.params.id]);
  res.json({ status: "atualizacao_pedida" });
});

// Login no painel de controlo — verifica a password que o proprio cliente
// definiu no wizard (nunca vista pelo dono do D3NA) e devolve os dados
// editaveis do site.
router.post("/:id/panel/login", async (req, res) => {
  const { password } = req.body;
  const result = await query("SELECT * FROM site_builds WHERE build_id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });

  const site = result.rows[0];
  if (!site.panel_password_hash) {
    return res.status(403).json({ error: "Este site ainda não tem painel de controlo ativado." });
  }
  const ok = password && (await bcrypt.compare(password, site.panel_password_hash));
  if (!ok) return res.status(401).json({ error: "Password incorreta." });

  res.json({
    company_name: site.company_name,
    company_description: site.company_description,
    contact_links: site.contact_links ? JSON.parse(site.contact_links) : [],
    catalog_items: site.catalog_items ? JSON.parse(site.catalog_items) : [],
    gallery_items: site.gallery_items ? JSON.parse(site.gallery_items) : [],
    color_scheme: site.color_scheme,
    font_choice: site.font_choice,
    logo_choice: site.logo_choice,
    domain_choice: site.domain_choice,
    structure_choice: site.structure_choice,
    site_url: site.site_url,
  });
});

// Guarda as alteracoes feitas no painel. Volta a confirmar a password em cada
// pedido, porque este acesso e por site (nao ha sessao/login persistente).
router.patch("/:id/panel", async (req, res) => {
  const {
    password, company_name, company_description, contact_links,
    catalog_items, gallery_items, color_scheme, font_choice, logo_choice,
  } = req.body;

  const check = await query("SELECT panel_password_hash FROM site_builds WHERE build_id = $1", [req.params.id]);
  if (check.rows.length === 0) return res.status(404).json({ error: "Construção não encontrada." });

  const hash = check.rows[0].panel_password_hash;
  const ok = hash && password && (await bcrypt.compare(password, hash));
  if (!ok) return res.status(401).json({ error: "Password incorreta." });

  await query(
    `UPDATE site_builds SET
       company_name = COALESCE($2, company_name),
       company_description = COALESCE($3, company_description),
       contact_links = COALESCE($4, contact_links),
       catalog_items = COALESCE($5, catalog_items),
       gallery_items = COALESCE($6, gallery_items),
       color_scheme = COALESCE($7, color_scheme),
       font_choice = COALESCE($8, font_choice),
       logo_choice = COALESCE($9, logo_choice)
     WHERE build_id = $1`,
    [
      req.params.id,
      company_name || null,
      company_description || null,
      contact_links ? JSON.stringify(contact_links) : null,
      catalog_items ? JSON.stringify(catalog_items) : null,
      gallery_items ? JSON.stringify(gallery_items) : null,
      color_scheme || null,
      font_choice || null,
      logo_choice || null,
    ]
  );

  res.json({ status: "guardado" });
});

export default router;
