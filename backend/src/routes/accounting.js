import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";
import { calcularTaxaFaciPay } from "../lib/feeCalculator.js";

const router = Router();

// Contabilidade — receita bruta vs liquida, descontando a taxa real do FaciPay (metodo MCX Express
// por defeito, o mais usado pelos clientes). Cada transacao confirmada e recalculada individualmente,
// porque a taxa nao e uma percentagem fixa (tem minimo + percentagem, ver feeCalculator.js).
router.get("/summary", requireAdminKey, async (req, res) => {
  const metodo = req.query.metodo || "mcx_express";

  const [subs, sites, cursos] = await Promise.all([
    query(`SELECT amount, plan_name FROM subscriptions WHERE payment_status = 'confirmado'`),
    query(`SELECT amount, tier FROM site_builds WHERE payment_status = 'confirmado'`),
    query(`SELECT amount, course_name FROM course_enrollments WHERE payment_status = 'confirmado'`),
  ]);

  function processar(linhas, servico) {
    return linhas.map((r) => {
      const valor = parseFloat(r.amount);
      const calc = calcularTaxaFaciPay(valor, metodo);
      return { servico, valor_bruto: valor, taxa_facipay: calc.totalDescontado, valor_liquido: calc.liquido };
    });
  }

  const transacoes = [
    ...processar(subs.rows, "consultoria"),
    ...processar(sites.rows, "construtor"),
    ...processar(cursos.rows, "curso"),
  ];

  const receita_bruta = transacoes.reduce((s, t) => s + t.valor_bruto, 0);
  const total_taxas_facipay = transacoes.reduce((s, t) => s + t.taxa_facipay, 0);
  const receita_liquida = transacoes.reduce((s, t) => s + t.valor_liquido, 0);

  const porServico = {};
  for (const t of transacoes) {
    if (!porServico[t.servico]) porServico[t.servico] = { bruto: 0, taxas: 0, liquido: 0, count: 0 };
    porServico[t.servico].bruto += t.valor_bruto;
    porServico[t.servico].taxas += t.taxa_facipay;
    porServico[t.servico].liquido += t.valor_liquido;
    porServico[t.servico].count += 1;
  }

  res.json({
    metodo_assumido: metodo,
    receita_bruta: Math.round(receita_bruta * 100) / 100,
    total_taxas_facipay: Math.round(total_taxas_facipay * 100) / 100,
    receita_liquida: Math.round(receita_liquida * 100) / 100,
    por_servico: porServico,
    nota: "Comissoes de afiliados ainda nao contabilizadas — programa de afiliados por construir.",
  });
});

export default router;
