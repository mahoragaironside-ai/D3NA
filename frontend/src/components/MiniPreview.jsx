import React from "react";

// Maquete pequena e honesta do site: não é o site real, mas dá uma ideia
// visual concreta da estrutura + estilo + cores escolhidas, antes de pagar.
const SECOES_POR_ESTRUTURA = {
  1: ["capa", "sobre", "contacto"],
  2: ["capa", "catalogo", "contacto"],
  3: ["capa", "sobre", "catalogo", "contacto"],
  4: ["capa", "galeria", "testemunhos", "contacto"],
  5: ["capa", "sobre", "catalogo", "galeria", "contacto"],
};

export default function MiniPreview({ structureId, styleId, primary, secondary, companyName }) {
  const secoes = SECOES_POR_ESTRUTURA[structureId] || SECOES_POR_ESTRUTURA[1];
  const nome = companyName || "A tua empresa";
  const inicial = nome.slice(0, 2).toUpperCase();

  const isClassico = styleId === 2;
  const isModerno = styleId === 3;
  const isEditorial = styleId === 4;
  const isCartao = styleId === 5;

  const fontFamily = isClassico ? "Georgia, serif" : "-apple-system, sans-serif";
  const radius = isClassico ? 2 : isModerno ? 10 : 6;
  const spacing = isEditorial ? 14 : 8;

  return (
    <div style={{ border: "1px solid #E3E6EB", borderRadius: 10, overflow: "hidden", background: "#fff", fontFamily }}>
      <div style={{ background: primary, color: "#fff", padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ background: secondary, color: primary, fontWeight: 700, fontSize: 10, width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {inicial}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600 }}>{nome}</span>
      </div>

      <div style={{ padding: spacing, display: "flex", flexDirection: "column", gap: spacing }}>
        {secoes.map((s) => (
          <Seccao key={s} tipo={s} primary={primary} secondary={secondary} radius={radius} cartao={isCartao} moderno={isModerno} editorial={isEditorial} />
        ))}
      </div>
    </div>
  );
}

function Seccao({ tipo, primary, secondary, radius, cartao, moderno, editorial }) {
  const box = { borderRadius: radius, background: "#F5F6F8", padding: 8 };
  const barra = (w, h = 6) => <div style={{ width: w, height: h, borderRadius: 3, background: "#D7DBE2", marginBottom: 4 }} />;

  if (tipo === "capa") {
    return (
      <div style={{ ...box, background: moderno ? primary : "#F5F6F8", color: moderno ? "#fff" : "#15181F", textAlign: "center", padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Bem-vindo</div>
        <div style={{ fontSize: 9, opacity: 0.75 }}>Uma frase curta sobre o negócio</div>
      </div>
    );
  }
  if (tipo === "sobre") {
    return <div style={box}>{barra("40%")}{barra("90%")}{barra("70%")}</div>;
  }
  if (tipo === "catalogo") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: cartao ? "1fr 1fr 1fr" : "1fr 1fr", gap: 6 }}>
        {Array.from({ length: cartao ? 3 : 2 }).map((_, i) => (
          <div key={i} style={{ ...box, textAlign: "center" }}>
            <div style={{ width: "100%", height: 24, background: secondary, borderRadius: radius, marginBottom: 4 }} />
            {barra("60%", 5)}
          </div>
        ))}
      </div>
    );
  }
  if (tipo === "galeria") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: editorial ? "1fr" : "1fr 1fr", gap: 6 }}>
        {Array.from({ length: editorial ? 1 : 2 }).map((_, i) => (
          <div key={i} style={{ width: "100%", height: editorial ? 46 : 28, background: secondary, borderRadius: radius }} />
        ))}
      </div>
    );
  }
  if (tipo === "testemunhos") {
    return <div style={box}>{barra("30%")}{barra("95%")}<div style={{ fontSize: 9, color: primary, fontWeight: 600, marginTop: 4 }}>— Cliente satisfeito</div></div>;
  }
  return (
    <div style={{ ...box, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {barra("50%")}
      <div style={{ background: primary, color: "#fff", fontSize: 9, padding: "4px 8px", borderRadius: radius }}>Contactar</div>
    </div>
  );
}
