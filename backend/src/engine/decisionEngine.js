import { calculate } from "./calculationEngine.js";

const NUMERIC_CATEGORIES = new Set(["compra", "stock", "importacao"]);

export function runDecisionEngine(memory, category) {
  if (!NUMERIC_CATEGORIES.has(category)) return null;

  const numbers = calculate(memory);
  if (!numbers) return null;

  const has = (k) => memory[k] !== undefined && memory[k].value !== undefined && memory[k].value !== "";
  const { capitalDisponivel, investimentoTotal, margem, exposicao, criticalCostsUnknown } = numbers;

  const usingEssential = memory.using_essential_money?.value === true;
  const supplierTrust = memory.supplier_trust?.value;
  const demandLevel = has("demand_evidence_level") ? Number(memory.demand_evidence_level.value) : 0;

  const missing = [];
  if (!has("essential_expenses")) missing.push("despesas essenciais");
  if (!has("committed_money")) missing.push("dinheiro já comprometido");
  if (numbers.criticalCostsUnknown) {
    if (!has("shipping_cost")) missing.push("custo de transporte");
    if (!has("taxes_known")) missing.push("taxas conhecidas");
  }
  if (!has("sale_price")) missing.push("preço de venda estimado");
  if (!has("demand_evidence_level")) missing.push("evidência de procura");
  if (!has("supplier_trust")) missing.push("confiança no fornecedor");

  let decision, decisionLabel, tone, reason;

  // Regras de bloqueio, nesta ordem de prioridade (ver documento de arquitetura, secção 7)
  if (capitalDisponivel <= 0) {
    decision = "nao_avancar"; decisionLabel = "🔴 NÃO AVANÇAR"; tone = "red";
    reason = "O capital disponível para risco é zero ou negativo depois de retirar despesas essenciais e dinheiro já comprometido.";
  } else if (usingEssential) {
    decision = "nao_recomendar"; decisionLabel = "🔴 NÃO RECOMENDAR AVANÇAR"; tone = "red";
    reason = "Este investimento dependeria de dinheiro essencial.";
  } else if (investimentoTotal > capitalDisponivel) {
    decision = "nao_avancar"; decisionLabel = "🔴 NÃO AVANÇAR"; tone = "red";
    reason = `O investimento total (${fmt(investimentoTotal)}) ultrapassa o capital disponível (${fmt(capitalDisponivel)}).`;
  } else if (criticalCostsUnknown) {
    decision = "nao_decidir"; decisionLabel = "🟡 NÃO DECIDIR AINDA"; tone = "amber";
    reason = "Faltam custos críticos (transporte e taxas) para confiar na margem calculada.";
  } else if (margem !== undefined && margem < 0) {
    decision = "nao_comprar"; decisionLabel = "🔴 NÃO COMPRAR NESTAS CONDIÇÕES"; tone = "red";
    reason = `A margem estimada é negativa (${margem.toFixed(1)}%).`;
  } else if (supplierTrust === "baixo") {
    decision = "nao_pagar"; decisionLabel = "🔴 NÃO PAGAR AINDA"; tone = "red";
    reason = "A confiança no fornecedor foi classificada como baixa.";
  } else if (exposicao > 70 && demandLevel <= 1) {
    decision = "testar"; decisionLabel = "🟡 TESTAR PRIMEIRO"; tone = "amber";
    reason = `O investimento representa ${exposicao.toFixed(0)}% do capital disponível, sem evidência real de procura.`;
  } else if (margem !== undefined && margem < 15) {
    decision = "reduzir"; decisionLabel = "🟡 REDUZIR O RISCO"; tone = "amber";
    reason = `Margem estimada (${margem.toFixed(1)}%) positiva mas apertada.`;
  } else {
    decision = "avancar"; decisionLabel = "🟢 AVANÇAR"; tone = "green";
    reason = `Margem estimada de ${margem !== undefined ? margem.toFixed(1) + "%" : "positiva"}, exposição de ${exposicao.toFixed(0)}%, sem bloqueadores críticos.`;
  }

  const risks = buildRisks({ exposicao, demandLevel, supplierTrust, missing, has });
  const nextActions = buildNextActions(decision, missing);

  return {
    decision, decisionLabel, tone, reason,
    numbers, risks, missing, nextActions,
    scenarios: numbers.scenarios,
  };
}

function buildRisks({ exposicao, demandLevel, supplierTrust, missing }) {
  const risks = [
    {
      name: "Risco de capital",
      level: exposicao > 70 ? "alto" : exposicao > 40 ? "médio" : "baixo",
      note: `${isFinite(exposicao) ? exposicao.toFixed(0) : "—"}% do capital disponível está exposto.`,
    },
    {
      name: "Risco de procura",
      level: demandLevel <= 1 ? "alto" : demandLevel <= 3 ? "médio" : "baixo",
      note: `Nível de evidência: ${demandLevel}/5.`,
    },
    {
      name: "Risco de fornecedor",
      level: supplierTrust === "baixo" ? "alto" : supplierTrust === "medio" ? "médio" : supplierTrust === "alto" ? "baixo" : "desconhecido",
      note: supplierTrust ? `Confiança classificada como ${supplierTrust}.` : "Ainda não avaliado.",
    },
    {
      name: "Risco de informação",
      level: missing.length > 3 ? "alto" : missing.length > 0 ? "médio" : "baixo",
      note: missing.length > 0 ? `${missing.length} dado(s) por confirmar.` : "Informação essencial completa.",
    },
  ];
  const order = { alto: 0, médio: 1, desconhecido: 1, baixo: 2 };
  return risks.sort((a, b) => order[a.level] - order[b.level]);
}

function buildNextActions(decision, missing) {
  const actions = [];
  const map = {
    nao_avancar: ["Rever o capital disponível antes de qualquer compra.", "Considerar uma quantidade menor."],
    nao_recomendar: ["Rever o capital disponível antes de qualquer compra.", "Considerar uma quantidade menor."],
    nao_decidir: ["Confirmar o custo de transporte.", "Confirmar taxas/impostos aplicáveis."],
    nao_comprar: ["Negociar um custo de compra mais baixo, ou rever o preço de venda."],
    nao_pagar: ["Pedir referências do fornecedor.", "Propor pagamento parcial em vez de total adiantado."],
    testar: ["Fazer uma pré-venda ou publicação de teste antes de comprar tudo.", "Reduzir a quantidade inicial."],
    reduzir: ["Negociar o custo por unidade.", "Confirmar procura real antes de comprometer o capital total."],
    avancar: ["Avançar com a compra nas condições indicadas.", "Registar os números reais após a venda."],
  };
  actions.push(...(map[decision] || []));
  if (missing.length > 0) actions.push(`Confirmar: ${missing.slice(0, 2).join(", ")}.`);
  return actions;
}

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("pt-PT") + " Kz";
}
