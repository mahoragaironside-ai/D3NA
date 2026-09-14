import React from "react";

// Maquete pequena e honesta do site: não é o site real, mas dá uma ideia
// visual concreta da estrutura + estilo + cores + nome + pequenos efeitos,
// antes de pagar.
const SECOES_POR_ESTRUTURA = {
  1: ["capa", "sobre", "contacto"],
  2: ["capa", "catalogo", "contacto"],
  3: ["capa", "sobre", "catalogo", "contacto"],
  4: ["capa", "galeria", "testemunhos", "contacto"],
  5: ["capa", "sobre", "catalogo", "galeria", "contacto"],
};

export default function MiniPreview({ structureId, styleId, primary, secondary, companyName, big }) {
  const secoes = SECOES_POR_ESTRUTURA[structureId] || SECOES_POR_ESTRUTURA[1];
  const nome = companyName || "A tua empresa";
  const inicio = nome.slice(0, 2);
  const resto = nome.slice(2);

  const isClassico = styleId === 2;
  const isModerno = styleId === 3;
  const isEditorial = styleId === 4;
  const isCartao = styleId === 5;

  const fontFamily = isClassico ? "Georgia, serif" : "-apple-system, sans-serif";
  const radius = isClassico ? 2 : isModerno ? 10 : 6;
  const spacing = isEditorial ? 14 : 8;
  const scale = big ? 1.4 : 1;

  return (
    <div style={{ border: "1px solid #E3E6EB", borderRadius: 10, overflow: "hidden", background: "#fff", fontFamily, fontSize: 13 * scale }}>
      <style>{`
        @keyframes d3na_fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes d3na_pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .d3na_prev_capa { animation: d3na_fade 0.6s ease; }
        .d3na_prev_btn { animation: d3na_pulse 1.6s ease-in-out infinite; }
      `}</style>

      <div style={{ background: primary, color: "#fff", padding: `${8 * scale}px ${10 * scale}px`, display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12 * scale, fontWeight: 600 }}>
          <span style={{ color: secondary, fontWeight: 800 }}>{inicio}</span>
          {resto}
        </span>
      </div>

      <div style={{ padding: spacing * scale, display: "flex", flexDirection: "column", gap: spacing * scale }}>
        {secoes.map((s) => (
          <Seccao key={s} tipo={s} primary={primary} secondary={secondary} radius={radius} cartao={isCartao} moderno={isModerno} editorial={isEditorial} animar={isModerno || isEditorial} scale={scale} />
        ))}
      </div>
    </div>
  );
}

function Seccao({ tipo, primary, secondary, radius, cartao, moderno, editorial, animar, scale }) {
  const box = { borderRadius: radius, background: "#F5F6F8", padding: 8 * scale };
  const barra = (w, h = 6) => <div style={{ width: w, height: h * scale, borderRadius: 3, background: "#D7DBE2", marginBottom: 4 }} />;

  if (tipo === "capa") {
    return (
      <div className={animar ? "d3na_prev_capa" : ""} style={{ ...box, background: moderno ? primary : "#F5F6F8", color: moderno ? "#fff" : "#15181F", textAlign: "center", padding: 16 * scale }}>
        <div style={{ fontSize: 12 * scale, fontWeight: 700, marginBottom: 4 }}>Bem-vindo</div>
        <div style={{ fontSize: 9 * scale, opacity: 0.75 }}>Uma frase curta sobre o negócio</div>
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
            <div style={{ width: "100%", height: 24 * scale, background: secondary, borderRadius: radius, marginBottom: 4 }} />
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
          <div key={i} className={animar ? "d3na_prev_capa" : ""} style={{ width: "100%", height: (editorial ? 46 : 28) * scale, background: secondary, borderRadius: radius }} />
        ))}
      </div>
    );
  }
  if (tipo === "testemunhos") {
    return <div style={box}>{barra("30%")}{barra("95%")}<div style={{ fontSize: 9 * scale, color: primary, fontWeight: 600, marginTop: 4 }}>— Cliente satisfeito</div></div>;
  }
  return (
    <div style={{ ...box, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {barra("50%")}
      <div className={animar ? "d3na_prev_btn" : ""} style={{ background: primary, color: "#fff", fontSize: 9 * scale, padding: `${4 * scale}px ${8 * scale}px`, borderRadius: radius }}>Contactar</div>
    </div>
  );
}
