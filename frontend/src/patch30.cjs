const fs = require("fs");
let s = fs.readFileSync("pages/AffiliatePanel.jsx", "utf8");
const marker = "  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;";
if (!s.includes(marker)) { console.log("FALHOU - marcador nao encontrado"); process.exit(1); }

const blocoErro = `  if (erroCarregar || !affiliate) {
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

`;

s = s.replace(marker, blocoErro + marker);
fs.writeFileSync("pages/AffiliatePanel.jsx", s);
console.log("1/1 alteracoes aplicadas (bloco de erro reinserido na ordem certa)");
