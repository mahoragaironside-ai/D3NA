const fs = require("fs");
let s = fs.readFileSync("pages/AffiliatePanel.jsx", "utf8");
const a = `  if (erroCarregar || !affiliate) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 300 }}>
          <div style={{ color: "#91A7C4", marginBottom: 14, fontSize: 14 }}>
            Não foi possível carregar os teus dados. O servidor pode estar a acordar — tenta de novo em alguns segundos.
          </div>
          <div style={{ color: "#FF3D77", marginBottom: 14, fontSize: 12, fontFamily: "monospace" }}>
            Erro real: {ultimoErro || "(sem detalhe)"}
          </div>
          <button onClick={load} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#007BFF", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Tentar novamente
          </button>
        </div>
      </Centered>
    );
  }

  if (notAffiliate) {`;
const b = `  if (notAffiliate) {`;
if (s.split(a).length === 2) {
  s = s.replace(a, "  if (notAffiliate) {");
  console.log("1/1 alteracoes aplicadas (bloco de erro movido)");
} else { console.log("FALHOU - texto nao encontrado exatamente assim"); }
fs.writeFileSync("pages/AffiliatePanel.jsx", s);
