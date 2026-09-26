// Calculo da taxa real do FaciPay, com base em testes reais feitos na app (Set/2026).
// Formula confirmada: taxa = maior entre um minimo fixo ou uma percentagem do valor;
// o valor cobrado ao beneficiario inclui ainda 14% de IVA sobre essa taxa (nao sobre o valor todo).
const METODOS = {
  directo:   { minimo: 25,  percentagem: 0.005 },
  mcx_express: { minimo: 50,  percentagem: 0.007 },
  multcx:    { minimo: 300, percentagem: 0 }, // fixo, sem componente percentual confirmada
};

// MCX Express e o metodo assumido por defeito — e o mais realista para os clientes do D3NA
// (poucos tem FaciPay-a-FaciPay "Directo", e ninguem se desloca a um ATM para pagar Referencia).
export function calcularTaxaFaciPay(valorBruto, metodo = "mcx_express") {
  const cfg = METODOS[metodo] || METODOS.mcx_express;
  const taxa = Math.max(cfg.minimo, valorBruto * cfg.percentagem);
  const totalDescontado = Math.round(taxa * 1.14 * 100) / 100;
  const liquido = Math.round((valorBruto - totalDescontado) * 100) / 100;
  return { taxa, totalDescontado, liquido, metodo };
}
