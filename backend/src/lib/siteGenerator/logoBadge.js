// Gera o HTML+CSS do logo (iniciais), com as mesmas formas do LogoPreview.jsx
// e do MiniPreview.jsx do frontend. Independente do Estilo — vem de logo_choice.
// Cada variante tem uma animação subtil e contínua própria.
// O logo adapta-se automaticamente à fonte escolhida: usa min-width/padding em
// vez de tamanho fixo, para que o "bounding box" cresça com letras mais largas.
export function logoBadgeCSS(logoChoice, primary, secondary, fontFamily) {
  const ff = fontFamily || "-apple-system, Helvetica, Arial, sans-serif";
  const base = `.logo-mark { display:inline-flex; align-items:center; justify-content:center; min-width:36px; min-height:36px; padding:6px 8px; box-sizing:border-box; flex-shrink:0; font-family:${ff}; }`;

  const keyframes = `
    @keyframes logoPulse { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.08); } }
    @keyframes logoBounce { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
    @keyframes logoPing { 0% { box-shadow:0 0 0 0 ${primary}66; } 70% { box-shadow:0 0 0 6px ${primary}00; } 100% { box-shadow:0 0 0 0 ${primary}00; } }
    @keyframes logoSlide { 0%, 100% { transform:translateX(0); } 50% { transform:translateX(3px); } }
    @keyframes logoFloat { 0%, 100% { transform:translate(2px,2px); opacity:0.35; } 50% { transform:translate(4px,4px); opacity:0.55; } }
    @keyframes logoGradient { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
    @keyframes logoSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  `;

  const variantes = {
    1: `.logo-mark-1 { background:${primary}; border-radius:11px; animation:logoPulse 2.2s ease-in-out infinite; }
        .logo-mark-1 span { color:${secondary}; font-weight:900; font-size:15px; letter-spacing:-1px; white-space:nowrap; }`,

    2: `.logo-mark-2 { border-radius:11px; overflow:hidden; padding:0; min-width:36px; }
        .logo-mark-2 .half { padding:6px 8px; height:100%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; animation:logoBounce 1.8s ease-in-out infinite; white-space:nowrap; }
        .logo-mark-2 .h1 { background:${primary}; color:${secondary}; }
        .logo-mark-2 .h2 { background:${secondary}; color:${primary}; border:1px solid ${primary}; animation-delay:0.3s; }`,

    3: `.logo-mark-3 { background:#fff; border-radius:999px; border:2px solid ${primary}; animation:logoPing 2s ease-out infinite; }
        .logo-mark-3 span { font-size:13px; font-weight:800; white-space:nowrap; }
        .logo-mark-3 .outline { color:${primary}; -webkit-text-stroke:1px ${primary}; -webkit-text-fill-color:transparent; }
        .logo-mark-3 .fill { color:${primary}; }`,

    4: `.logo-mark-4 { width:auto; min-width:0; overflow:visible; }
        .logo-mark-4 span { font-family:${ff}; font-size:18px; color:${primary}; border-bottom:2px solid ${primary}; padding-bottom:1px; display:inline-block; white-space:nowrap; animation:logoSlide 1.8s ease-in-out infinite; }`,

    5: `.logo-mark-5 { position:relative; min-width:0; }
        .logo-mark-5 .shadow { position:absolute; font-size:15px; font-weight:900; color:${primary}; opacity:0.35; white-space:nowrap; animation:logoFloat 2.4s ease-in-out infinite; }
        .logo-mark-5 .front { position:relative; font-size:15px; font-weight:900; color:${primary}; white-space:nowrap; }`,

    6: `.logo-mark-6 { border-radius:11px; background:linear-gradient(120deg, ${primary}, ${secondary}, ${primary}); background-size:200% 200%; animation:logoGradient 3s ease infinite; }
        .logo-mark-6 span { color:#fff; font-weight:900; font-size:15px; letter-spacing:-1px; white-space:nowrap; text-shadow:0 1px 3px rgba(0,0,0,0.25); }`,

    7: `.logo-mark-7 { position:relative; background:#fff; border-radius:999px; }
        .logo-mark-7 .ring { position:absolute; inset:-6px; border-radius:999px; border:2px dashed ${primary}; animation:logoSpin 6s linear infinite; }
        .logo-mark-7 span { position:relative; color:${primary}; font-weight:800; font-size:13px; white-space:nowrap; }`,
  };

  return base + keyframes + (variantes[logoChoice] || variantes[1]);
}

export function logoBadgeHTML(logoChoice, iniciais) {
  const L1 = iniciais[0] || "D";
  const L2 = iniciais[1] || "3";

  if (logoChoice === 2) {
    return `<div class="logo-mark logo-mark-2"><div class="half h1">${L1}</div><div class="half h2">${L2}</div></div>`;
  }
  if (logoChoice === 3) {
    return `<div class="logo-mark logo-mark-3"><span><span class="outline">${L1}</span><span class="fill">${L2}</span></span></div>`;
  }
  if (logoChoice === 4) {
    return `<div class="logo-mark logo-mark-4"><span>${L1}${L2.toLowerCase()}</span></div>`;
  }
  if (logoChoice === 5) {
    return `<div class="logo-mark logo-mark-5"><span class="shadow">${L1}${L2}</span><span class="front">${L1}${L2}</span></div>`;
  }
  if (logoChoice === 6) {
    return `<div class="logo-mark logo-mark-6"><span>${L1}${L2}</span></div>`;
  }
  if (logoChoice === 7) {
    return `<div class="logo-mark logo-mark-7"><span class="ring"></span><span>${L1}${L2}</span></div>`;
  }
  return `<div class="logo-mark logo-mark-1"><span>${L1}${L2}</span></div>`;
}
