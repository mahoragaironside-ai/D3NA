import React from "react";

// Maquete pequena e honesta do site: não é o site real, mas dá uma ideia
// visual concreta da estrutura + estilo + cores + nome + logo + pequenos efeitos,
// antes de pagar.
const SECOES_POR_ESTRUTURA = {
  1: ["capa", "sobre", "contacto"],
  2: ["capa", "catalogo", "contacto"],
  3: ["capa", "sobre", "catalogo", "contacto"],
  4: ["capa", "galeria", "testemunhos", "contacto"],
  5: ["capa", "sobre", "catalogo", "galeria", "contacto"],
};

function LogoMark({ logoChoice, L1, L2, primary, secondary, scale }) {
  const size = 20 * scale;
  const fs = 10 * scale;
  const base = { width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

  if (logoChoice === 2) {
    return (
      <div style={{ ...base, borderRadius: 5, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, background: secondary, display: "flex", alignItems: "center", justifyContent: "center", animation: "mp_logoBounce 1.8s ease-in-out infinite" }}>
          <span style={{ color: primary, fontWeight: 800, fontSize: fs * 0.8 }}>{L1}</span>
        </div>
        <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animation: "mp_logoBounce 1.8s ease-in-out infinite", animationDelay: "0.3s" }}>
          <span style={{ color: primary, fontWeight: 800, fontSize: fs * 0.8 }}>{L2}</span>
        </div>
      </div>
    );
  }
  if (logoChoice === 3) {
    return (
      <div style={{ ...base, background: "#fff", borderRadius: "50%", border: `1.5px solid ${secondary}`, animation: "mp_logoPing 2s ease-out infinite" }}>
        <span style={{ color: primary, fontWeight: 800, fontSize: fs * 0.8 }}>{L1}{L2}</span>
      </div>
    );
  }
  if (logoChoice === 4) {
    return (
      <div style={{ ...base, overflow: "hidden" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: fs * 1.1, color: secondary, borderBottom: `1px solid ${secondary}`, display: "inline-block", animation: "mp_logoSlide 1.8s ease-in-out infinite" }}>{L1}{L2.toLowerCase()}</span>
      </div>
    );
  }
  if (logoChoice === 5) {
    return (
      <div style={{ ...base, position: "relative" }}>
        <span style={{ position: "absolute", fontSize: fs, fontWeight: 900, color: secondary, opacity: 0.4, animation: "mp_logoFloat 2.4s ease-in-out infinite" }}>{L1}{L2}</span>
        <span style={{ position: "relative", fontSize: fs, fontWeight: 900, color: secondary }}>{L1}{L2}</span>
      </div>
    );
  }
  if (logoChoice === 6) {
    return (
      <div style={{ ...base, borderRadius: 5, background: `linear-gradient(120deg, ${primary}, ${secondary}, ${primary})`, backgroundSize: "200% 200%", animation: "mp_logoGradient 3s ease infinite" }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: fs * 0.8, textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}>{L1}{L2}</span>
      </div>
    );
  }
  if (logoChoice === 7) {
    return (
      <div style={{ ...base, position: "relative", background: "#fff", borderRadius: "50%" }}>
        <span style={{ position: "absolute", inset: -2, borderRadius: "50%", border: `1.5px dashed ${secondary}`, animation: "mp_logoSpin 6s linear infinite" }} />
        <span style={{ position: "relative", color: primary, fontWeight: 800, fontSize: fs * 0.8 }}>{L1}{L2}</span>
      </div>
    );
  }
  // 1 (padrão/minimalista) ou nenhum escolhido ainda
  return (
    <div style={{ ...base, background: secondary, borderRadius: "50%", animation: "mp_logoPulse 2.2s ease-in-out infinite" }}>
      <span style={{ color: primary, fontWeight: 800, fontSize: fs * 0.75 }}>{L1}{L2}</span>
    </div>
  );
}

export default function MiniPreview({ structureId, styleId, primary, secondary, companyName, logoChoice, big }) {
  const secoes = SECOES_POR_ESTRUTURA[structureId] || SECOES_POR_ESTRUTURA[1];
  const nome = companyName || "A tua empresa";
  const L1 = (nome[0] || "D").toUpperCase();
  const L2 = (nome[1] || "3").toUpperCase();

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
        @keyframes mp_logoPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes mp_logoBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes mp_logoPing { 0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.25); } 70% { box-shadow: 0 0 0 4px rgba(0,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); } }
        @keyframes mp_logoSlide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
        @keyframes mp_logoFloat { 0%, 100% { transform: translate(1px, 1px); opacity: 0.35; } 50% { transform: translate(2px, 2px); opacity: 0.55; } }
        @keyframes mp_logoGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes mp_logoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: primary, color: "#fff", padding: `${8 * scale}px ${10 * scale}px`, display: "flex", alignItems: "center", gap: 8 * scale }}>
        <LogoMark logoChoice={logoChoice} L1={L1} L2={L2} primary={primary} secondary={secondary} scale={scale} />
        <span style={{ fontSize: 12 * scale, fontWeight: 600 }}>{nome}</span>
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
