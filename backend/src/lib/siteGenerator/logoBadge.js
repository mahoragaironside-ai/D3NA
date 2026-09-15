// Gera o HTML+CSS do logo (iniciais) conforme o Estilo escolhido (1 a 5).
// Cada estilo tem forma e animação de entrada próprias.
export function logoBadgeCSS(styleChoice, primary, secondary) {
  const base = `
    .logo-mark { display:flex; align-items:center; justify-content:center;
      font-weight:800; letter-spacing:0.5px; }
  `;
  const variantes = {
    // 1 — Minimalista: círculo simples, fade suave
    1: `
      .logo-mark { width:38px; height:38px; border-radius:50%;
        background:${primary}; color:${secondary}; font-size:13px;
        opacity:0; animation: logoFade 0.7s ease forwards; }
      @keyframes logoFade { to { opacity:1; } }
    `,
    // 2 — Clássico: quadrado com cantos levemente suaves, sem animação (sóbrio)
    2: `
      .logo-mark { width:40px; height:40px; border-radius:6px;
        background:${primary}; color:${secondary}; font-size:14px;
        border: 1px solid ${primary}; }
    `,
    // 3 — Moderno: círculo com leve rotação/escala de entrada
    3: `
      .logo-mark { width:36px; height:36px; border-radius:50%;
        background:${primary}; color:${secondary}; font-size:13px;
        transform: rotate(-15deg) scale(0.7); opacity:0;
        animation: logoPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
      @keyframes logoPop { to { transform: rotate(0) scale(1); opacity:1; } }
    `,
    // 4 — Editorial: forma tipográfica grande, sem fundo, sublinhado a desenhar-se
    4: `
      .logo-mark { width:auto; height:auto; background:none; color:${primary};
        font-size:22px; font-family: Georgia, serif; position:relative; padding-bottom:4px; }
      .logo-mark::after { content:""; position:absolute; bottom:0; left:0; height:2px;
        background:${primary}; width:0; animation: logoLine 0.8s ease forwards 0.2s; }
      @keyframes logoLine { to { width:100%; } }
    `,
    // 5 — Cartão/loja: hexágono simples via clip-path, entrada com "flutuar para cima"
    5: `
      .logo-mark { width:40px; height:40px; background:${primary}; color:${secondary};
        font-size:13px; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        transform: translateY(10px); opacity:0;
        animation: logoRise 0.6s ease forwards; }
      @keyframes logoRise { to { transform: translateY(0); opacity:1; } }
    `,
  };
  return base + (variantes[styleChoice] || variantes[1]);
}

export function logoBadgeHTML(iniciais) {
  return `<span class="logo-mark">${iniciais}</span>`;
}
