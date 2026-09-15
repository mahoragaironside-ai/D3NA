// Gera o HTML+CSS do logo (iniciais), com as mesmas 5 formas do LogoPreview.jsx
// do frontend. Agora é independente do Estilo — vem de logo_choice (1 a 5).
export function logoBadgeCSS(logoChoice, primary, secondary) {
  const base = `.logo-mark { display:flex; align-items:center; justify-content:center; width:36px; height:36px; flex-shrink:0; }`;

  const variantes = {
    1: `.logo-mark-1 { background:${primary}; border-radius:11px; }
        .logo-mark-1 span { color:${secondary}; font-weight:900; font-size:15px; letter-spacing:-2px; }`,

    2: `.logo-mark-2 { border-radius:11px; overflow:hidden; }
        .logo-mark-2 .half { flex:1; height:100%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; }
        .logo-mark-2 .h1 { background:${primary}; color:${secondary}; }
        .logo-mark-2 .h2 { background:${secondary}; color:${primary}; border:1px solid ${primary}; }`,

    3: `.logo-mark-3 { background:#fff; border-radius:50%; border:2px solid ${primary}; }
        .logo-mark-3 span { font-size:13px; font-weight:800; }
        .logo-mark-3 .outline { color:${primary}; -webkit-text-stroke:1px ${primary}; -webkit-text-fill-color:transparent; }
        .logo-mark-3 .fill { color:${primary}; }`,

    4: `.logo-mark-4 { width:auto; }
        .logo-mark-4 span { font-family: Georgia, serif; font-size:18px; color:${primary}; border-bottom:2px solid ${primary}; padding-bottom:1px; }`,

    5: `.logo-mark-5 { position:relative; }
        .logo-mark-5 .shadow { position:absolute; font-size:15px; font-weight:900; color:${primary}; opacity:0.35; transform:translate(2px,2px); }
        .logo-mark-5 .front { position:relative; font-size:15px; font-weight:900; color:${primary}; }`,
  };

  return base + (variantes[logoChoice] || variantes[1]);
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
  return `<div class="logo-mark logo-mark-1"><span>${L1}${L2}</span></div>`;
}
