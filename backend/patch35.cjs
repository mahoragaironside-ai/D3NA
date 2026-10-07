const fs = require("fs");
let s = fs.readFileSync("src/routes/siteBuilder.js", "utf8");
let n = 0;

const a1 = `import { awardCommissionDirect } from "../lib/affiliateCommissions.js";`;
const b1 = `import { awardCommissionDirect, awardResaleDifference } from "../lib/affiliateCommissions.js";`;
if (s.split(a1).length === 2) { s = s.replace(a1, b1); n++; } else { console.log("FALHOU 1"); }

const a2 = `    panel_password, referral_code,
  } = req.body;`;
const b2 = `    panel_password, referral_code, resale_link_code,
  } = req.body;`;
if (s.split(a2).length === 2) { s = s.replace(a2, b2); n++; } else { console.log("FALHOU 2"); }

const a3 = `  const isPro = tier === "pro";
  const amount = isPro ? process.env.PAYMENT_AMOUNT_SITE_PRO : process.env.PAYMENT_AMOUNT_SITE_BASICO;
  const reference = isPro ? process.env.PAYMENT_REFERENCE_SITE_PRO : process.env.PAYMENT_REFERENCE_SITE_BASICO;`;
const b3 = `  const isPro = tier === "pro";
  let amount = isPro ? process.env.PAYMENT_AMOUNT_SITE_PRO : process.env.PAYMENT_AMOUNT_SITE_BASICO;
  const reference = isPro ? process.env.PAYMENT_REFERENCE_SITE_PRO : process.env.PAYMENT_REFERENCE_SITE_BASICO;

  let resaleLinkId = null;
  if (resale_link_code) {
    const rl = await query(
      "SELECT * FROM resale_links WHERE access_code = $1 AND status = 'disponivel'",
      [String(resale_link_code).trim().toUpperCase()]
    );
    if (rl.rows.length === 0) {
      return res.status(400).json({ error: "Link de revenda inválido, já usado ou ainda não disponível." });
    }
    resaleLinkId = rl.rows[0].link_id;
    amount = rl.rows[0].resale_price;
  }`;
if (s.split(a3).length === 2) { s = s.replace(a3, b3); n++; } else { console.log("FALHOU 3"); }

const a4 = `panel_password_hash, publish_status, affiliate_id,
       amount, currency, payment_reference, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'pendente')
     RETURNING build_id\`,
    [
      business_category, business_type, color_scheme, structure_choice, style_choice,
      domain_choice || "blogger", isPro ? "pro" : "basico", company_name, company_description, contact_info,
      contact_links || null, logo_choice || null, catalog_items || null, gallery_items || null, font_choice || "sistema",
      panelPasswordHash, publishStatus, affiliateId,
      amount, process.env.PAYMENT_CURRENCY || "AOA", reference,
    ]`;
const b4 = `panel_password_hash, publish_status, affiliate_id, resale_link_id,
       amount, currency, payment_reference, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'pendente')
     RETURNING build_id\`,
    [
      business_category, business_type, color_scheme, structure_choice, style_choice,
      domain_choice || "blogger", isPro ? "pro" : "basico", company_name, company_description, contact_info,
      contact_links || null, logo_choice || null, catalog_items || null, gallery_items || null, font_choice || "sistema",
      panelPasswordHash, publishStatus, affiliateId, resaleLinkId,
      amount, process.env.PAYMENT_CURRENCY || "AOA", reference,
    ]`;
if (s.split(a4).length === 2) { s = s.replace(a4, b4); n++; } else { console.log("FALHOU 4"); }

const a5 = `  try {
    if (result.rows[0].affiliate_id) {
      await awardCommissionDirect(result.rows[0].affiliate_id, "construtor", result.rows[0].build_id);
    }
  } catch (e) {
    console.error("Falha ao atribuir comissao de afiliado (construtor):", e.message);
  }`;
const b5 = `  try {
    const site = result.rows[0];
    if (site.resale_link_id) {
      const rl = await query("SELECT * FROM resale_links WHERE link_id = $1", [site.resale_link_id]);
      const link = rl.rows[0];
      if (link) {
        const diff = Number(link.resale_price) - Number(link.company_price);
        await awardResaleDifference(link.affiliate_id, diff, site.build_id);
        await query(
          "UPDATE resale_links SET status = 'usado', used_at = now(), build_id = $1 WHERE link_id = $2",
          [site.build_id, link.link_id]
        );
      }
    } else if (site.affiliate_id) {
      await awardCommissionDirect(site.affiliate_id, "construtor", site.build_id);
    }
  } catch (e) {
    console.error("Falha ao atribuir comissao de afiliado (construtor):", e.message);
  }`;
if (s.split(a5).length === 2) { s = s.replace(a5, b5); n++; } else { console.log("FALHOU 5"); }

fs.writeFileSync("src/routes/siteBuilder.js", s);
console.log(n + "/5 alteracoes aplicadas");
