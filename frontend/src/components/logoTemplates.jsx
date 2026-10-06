import React from "react";

// 10 formas tematicas (1 por categoria). Cada uma corta as iniciais
// (text usada como mascara) dentro da propria silhueta, com uma camada
// desfasada atras, num tom mais escuro da mesma cor, para dar profundidade.
// A tipografia das iniciais e escolhida a parte (ver LOGO_FONTS) e passada
// aqui como prop "font" - por isso fica independente da forma escolhida.
// Cada forma tem a sua propria animacao (LOGO_KEYFRAMES), para nao ficarem
// estaticas nem todas iguais entre si.

function darken(hex, amount) {
  let h = (hex || "#7F77DD").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  let r = (num >> 16) - amount;
  let g = ((num >> 8) & 0x00ff) - amount;
  let b = (num & 0x0000ff) - amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function fontSizeFor(initials) {
  const n = (initials || "D3").length;
  if (n <= 2) return 30;
  if (n === 3) return 22;
  return 17;
}

function Shape({ id, uid, primary, path, polygon, rect, initials, font, anim }) {
  const maskId = `logomask-${uid}-${id}`;
  const shadow = darken(primary, 42);
  const common = { fill: primary, mask: `url(#${maskId})` };
  const commonShadow = { fill: shadow, transform: "translate(3,3)" };

  function body(props) {
    if (path) return <path d={path} {...props} />;
    if (polygon) return <polygon points={polygon} {...props} />;
    if (rect) return <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.rx} {...props} />;
    return null;
  }

  return (
    <svg viewBox="0 0 96 96" width="100%" height="100%">
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="96" height="96" fill="#fff" />
          <text x="48" y="58" textAnchor="middle" fontFamily={font || "Arial, sans-serif"} fontWeight="800" fontSize={fontSizeFor(initials)} fill="#000">
            {initials || "D3"}
          </text>
        </mask>
      </defs>
      <g style={{ animation: anim, transformOrigin: "48px 48px", transformBox: "fill-box" }}>
        {body(commonShadow)}
        {body(common)}
      </g>
    </svg>
  );
}

export const LOGO_KEYFRAMES = `
  @keyframes logoFlicker { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.05) rotate(-2deg); } }
  @keyframes logoBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes logoDrift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
  @keyframes logoSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
  @keyframes logoFlap { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.9); } }
  @keyframes logoSpinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes logoRise { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  @keyframes logoGlow { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.18); } }
  @keyframes logoShine { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
  @keyframes logoPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
`;

export const LOGO_FONTS = [
  { id: "sistema", label: "Sistema", family: "-apple-system, 'Segoe UI', Roboto, sans-serif", weight: 800, google: null },
  { id: "bungee", label: "Bungee (urbano/forte)", family: "'Bungee', sans-serif", weight: 400, google: "Bungee" },
  { id: "orbitron", label: "Orbitron (tecnológico)", family: "'Orbitron', sans-serif", weight: 800, google: "Orbitron:wght@800" },
  { id: "playfair", label: "Playfair Display (elegante)", family: "'Playfair Display', serif", weight: 900, google: "Playfair+Display:wght@900" },
  { id: "baloo", label: "Baloo 2 (suave/arredondado)", family: "'Baloo 2', sans-serif", weight: 800, google: "Baloo+2:wght@800" },
  { id: "space", label: "Space Grotesk (moderno)", family: "'Space Grotesk', sans-serif", weight: 700, google: "Space+Grotesk:wght@700" },
  { id: "russo", label: "Russo One (robusto)", family: "'Russo One', sans-serif", weight: 400, google: "Russo+One" },
  { id: "abril", label: "Abril Fatface (dramático)", family: "'Abril Fatface', serif", weight: 400, google: "Abril+Fatface" },
  { id: "righteous", label: "Righteous (amigável)", family: "'Righteous', sans-serif", weight: 400, google: "Righteous" },
];

export const LOGO_CATEGORIES = [
  { id: "fogo", label: "Fogo" },
  { id: "agua", label: "Água" },
  { id: "terra", label: "Terra" },
  { id: "plantas", label: "Plantas & Florestas" },
  { id: "animais", label: "Animais" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "transporte", label: "Transporte" },
  { id: "profissoes", label: "Profissões & Serviços" },
  { id: "negocios", label: "Negócios & Finanças" },
  { id: "abstrato", label: "Símbolos Abstratos" },
];

export const LOGO_TEMPLATES = [
  {
    id: "fogo-chama", category: "fogo", label: "Chama",
    render: (p) => <Shape {...p} id="fogo-chama" anim="logoFlicker 2s ease-in-out infinite" path="M48 16 C38 30, 28 44, 36 58 C40 66, 52 67, 56 59 C58 66, 68 67, 74 58 C84 44, 68 30, 48 16 Z" />,
  },
  {
    id: "agua-gota", category: "agua", label: "Gota",
    render: (p) => <Shape {...p} id="agua-gota" anim="logoBob 2.4s ease-in-out infinite" path="M48 18 C62 36, 76 50, 76 64 C76 78, 63 86, 48 86 C33 86, 20 78, 20 64 C20 50, 34 36, 48 18 Z" />,
  },
  {
    id: "terra-montanha", category: "terra", label: "Montanha",
    render: (p) => <Shape {...p} id="terra-montanha" anim="logoDrift 3.2s ease-in-out infinite" path="M8 78 L34 30 L48 52 L62 20 L90 78 Z" />,
  },
  {
    id: "plantas-folha", category: "plantas", label: "Folha",
    render: (p) => <Shape {...p} id="plantas-folha" anim="logoSway 2.6s ease-in-out infinite" path="M48 14 C70 14, 84 30, 84 50 C84 72, 66 84, 48 84 C48 72, 48 60, 48 50 C48 36, 48 24, 48 14 Z" />,
  },
  {
    id: "animais-ave", category: "animais", label: "Ave",
    render: (p) => <Shape {...p} id="animais-ave" anim="logoFlap 1.6s ease-in-out infinite" path="M6 58 C22 38, 36 50, 48 42 C60 50, 74 38, 90 58 C76 50, 64 62, 48 54 C32 62, 20 50, 6 58 Z" />,
  },
  {
    id: "tecnologia-hexagono", category: "tecnologia", label: "Hexágono",
    render: (p) => <Shape {...p} id="tecnologia-hexagono" anim="logoSpinSlow 9s linear infinite" polygon="48,10 82,29 82,67 48,86 14,67 14,29" />,
  },
  {
    id: "transporte-seta", category: "transporte", label: "Seta",
    render: (p) => <Shape {...p} id="transporte-seta" anim="logoRise 1.8s ease-in-out infinite" path="M48 12 L78 46 L60 46 L60 86 L36 86 L36 46 L18 46 Z" />,
  },
  {
    id: "profissoes-escudo", category: "profissoes", label: "Escudo",
    render: (p) => <Shape {...p} id="profissoes-escudo" anim="logoGlow 2.4s ease-in-out infinite" path="M48 10 L80 24 L80 50 C80 70, 66 82, 48 88 C30 82, 16 70, 16 50 L16 24 Z" />,
  },
  {
    id: "negocios-diamante", category: "negocios", label: "Diamante",
    render: (p) => <Shape {...p} id="negocios-diamante" anim="logoShine 2.2s ease-in-out infinite" polygon="48,8 88,48 48,88 8,48" />,
  },
  {
    id: "abstrato-squircle", category: "abstrato", label: "Squircle",
    render: (p) => <Shape {...p} id="abstrato-squircle" anim="logoPulse 2.2s ease-in-out infinite" rect={{ x: 10, y: 10, w: 76, h: 76, rx: 26 }} />,
  },
];
