// Motor matemático — puro, determinístico, sem chamadas a IA nem a rede.
// Recebe a memória do projeto (campos com {value, status}) e devolve os números derivados.

export function calculate(memory) {
  const val = (k) => (memory[k] !== undefined ? Number(memory[k].value) : undefined);

  const capitalTotal = val("capital_total");
  const unitPrice = val("unit_price");
  const quantity = val("quantity");

  if (capitalTotal === undefined || unitPrice === undefined || quantity === undefined) {
    return null; // dados insuficientes para o motor numérico
  }

  const essential = val("essential_expenses") || 0;
  const committed = val("committed_money") || 0;
  const capitalDisponivel = capitalTotal - essential - committed;

  const shipping = val("shipping_cost");
  const taxes = val("taxes_known");
  const other = val("other_costs") || 0;
  const criticalCostsUnknown = shipping === undefined && taxes === undefined;

  const investimentoTotal = unitPrice * quantity + (shipping || 0) + (taxes || 0) + other;
  const custoRealUnidade = investimentoTotal / quantity;
  const exposicao = capitalDisponivel > 0 ? (investimentoTotal / capitalDisponivel) * 100 : Infinity;

  const salePrice = val("sale_price");
  let receita, lucro, margem;
  if (salePrice !== undefined) {
    receita = salePrice * quantity;
    lucro = receita - investimentoTotal;
    margem = (lucro / receita) * 100;
  }

  let scenarios = null;
  if (salePrice !== undefined) {
    const build = (priceMult, qtyMult) => {
      const q = quantity * qtyMult;
      const rec = salePrice * priceMult * q;
      const inv = unitPrice * q + (shipping || 0) + (taxes || 0) + other;
      return { receita: rec, lucro: rec - inv };
    };
    scenarios = {
      positivo: build(1.15, 1),
      moderado: build(1, 1),
      negativo: build(0.85, 0.7),
    };
  }

  return {
    capitalDisponivel,
    investimentoTotal,
    custoRealUnidade,
    exposicao,
    receita,
    lucro,
    margem,
    criticalCostsUnknown,
    scenarios,
  };
}
