import { getColors } from "../colors.js";
import { getFontFamily } from "../fonts.js";
import { ICONES } from "./secoes.js";
import { logoBadgeCSS, logoBadgeHTML } from "./logoBadge.js";
import { adsCarouselCSS, adsCarouselHTML, adsCarouselScript } from "./adsCarousel.js";
import { catalogoCSS } from "./catalogo.js";
import { galeriaCSS } from "./galeria.js";
import { estilo1 } from "./estilo1.js";
import { estilo2 } from "./estilo2.js";
import { estilo4 } from "./estilo4.js";
import { estilo5 } from "./estilo5.js";



function renderContactBtns(contactLinks) {
  if (!contactLinks || contactLinks.length === 0) return "";
  return contactLinks.map((c) => {
    const isWa = c.platform === "whatsapp";
    const cls = isWa ? "btn btn-wa" : "btn btn-alt";
    const alvo = c.link.startsWith("tel:") ? "" : `target="_blank"`;
    return `<a class="${cls}" href="${c.link}" ${alvo}>${ICONES[c.platform] || "🔗"} ${c.label}</a>`;
  }).join("\n      ");
}

export function estilo3(dados, primary, secondary, iniciais, corpo, fontFamily = "-apple-system, Helvetica, Arial, sans-serif") {
  const { company_name, company_description, business_type, contact_links, logo_choice } = dados;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${company_name}</title>
<style>
  :root {
    --bg: #ffffff; --card-bg: #ffffff; --text: #1a1a1a; --text-soft: #555;
    --nav-bg: #ffffff; --nav-border: #eee; --footer-text: #999;
    --shadow: 0 8px 30px rgba(0,0,0,0.08);
  }
  body.dark {
    --bg: #121212; --card-bg: #1e1e1e; --text: #f0f0f0; --text-soft: #b8b8b8;
    --nav-bg: #1a1a1a; --nav-border: #2a2a2a; --footer-text: #777;
    --shadow: 0 8px 30px rgba(0,0,0,0.4);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  .watermark-logo {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 34vw; font-weight: 800; color: ${primary}; opacity: 0.045;
    pointer-events: none; z-index: 0; white-space: nowrap; user-select: none;
  }
  .watermark-d3na {
    position: fixed; bottom: 10px; right: 10px; font-size: 10px; font-weight: 700;
    color: var(--text-soft); opacity: 0.35; pointer-events: none; z-index: 5; letter-spacing: 1px;
  }
  .menu-d3na { position: absolute; bottom: 4px; right: 10px; font-size: 8px; color: var(--text-soft); opacity: 0.4; letter-spacing: 0.5px; }
  body { font-family: ${fontFamily}; color: var(--text); line-height: 1.6; background: var(--bg); transition: background 0.3s, color 0.3s; }

  ${logoBadgeCSS(logo_choice, primary, secondary, fontFamily)}
  ${adsCarouselCSS(primary)}

  .cta-flutuante {
    position: fixed; bottom: 22px; right: 18px; z-index: 40;
    display: flex; align-items: center; gap: 9px;
    background: rgba(255,255,255,0.14);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.35);
    color: ${secondary}; text-decoration: none;
    padding: 12px 20px 12px 14px; border-radius: 999px; font-weight: 700; font-size: 13.5px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25);
    animation: ctaEntrar 0.5s ease 1s both;
  }
  .cta-flutuante::before {
    content: ""; position: absolute; inset: -6px; border-radius: 999px;
    border: 1.5px solid ${primary}; opacity: 0; animation: ctaRing 2.6s ease-out infinite;
  }
  .cta-flutuante { position: fixed; }
  .cta-icone {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: ${primary}; display: flex; align-items: center; justify-content: center;
  }
  .cta-flutuante:active { transform: scale(0.96); }
  @keyframes ctaEntrar { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ctaRing { 0% { opacity: 0.5; transform: scale(0.92); } 100% { opacity: 0; transform: scale(1.18); } }
  ${catalogoCSS(primary)}
  ${galeriaCSS(primary)}

  nav {
    position: sticky; top: 0; z-index: 20;
    background: var(--nav-bg); border-bottom: 1px solid var(--nav-border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; transition: background 0.3s, border-color 0.3s;
  }
  nav .marca { display: flex; align-items: center; gap: 10px; font-weight: 700; color: ${primary}; }
  nav .direita { display: flex; align-items: center; gap: 4px; }

  .theme-btn, .menu-btn { background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; }
  .menu-btn { flex-direction: column; gap:4px; }
  .menu-btn span { width:20px; height:2px; background:${primary}; display:block; border-radius:2px; }

  .menu-drop {
    position: absolute; top: 56px; right: 16px; background: var(--card-bg);
    border-radius: 12px; box-shadow: var(--shadow);
    padding: 8px; display: none; flex-direction: column; min-width: 340px; max-width: calc(100vw - 32px); z-index: 30;
  }
  .menu-drop.on { display: flex; }
  .menu-drop a { padding: 10px 14px; color: var(--text); text-decoration:none; font-size:14px; border-radius:8px; }
  .menu-ad-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-soft); margin: 8px 14px 4px; }
  .menu-ad-box { padding: 4px 14px 10px; overflow: hidden; display: flex; justify-content: center; }
  .menu-ad-scale { width: 170px; height: 27px; overflow: hidden; }
  .menu-ad-inner { width: 320px; height: 50px; transform: scale(0.53125); transform-origin: top left; }

  header {
    background: linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%);
    color: ${secondary};
    padding: 70px 20px 90px;
    text-align: center;
  }
  header h1 { font-size: 30px; font-weight: 800; margin-bottom: 8px; }
  header p { font-size: 15px; opacity: 0.9; }
  header .hero-cta {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 18px;
    background: ${secondary}; color: ${primary}; border: none; border-radius: 30px;
    padding: 11px 22px; font-weight: 700; font-size: 13.5px; cursor: pointer;
    text-decoration: none;
  }
  header .badge {
    display: inline-block; background: rgba(255,255,255,0.18); border-radius: 20px;
    padding: 6px 16px; font-size: 12px; margin-bottom: 16px; letter-spacing: 0.5px;
  }

  .reveal { opacity: 0; transform: translateY(18px); transition: all 0.6s ease; }
  .reveal.on { opacity: 1; transform: translateY(0); }

  section { max-width: 680px; margin: -40px auto 0; padding: 0 20px 50px; position: relative; }
  .card {
    background: var(--card-bg); border-radius: 16px; padding: 28px;
    box-shadow: var(--shadow); margin-bottom: 20px; transition: background 0.3s;
  }
  .card h2 { font-size: 19px; color: ${primary}; margin-bottom: 12px; font-weight: 800; }
  .card p { font-size: 14.5px; color: var(--text-soft); }

  .testemunhos { display: flex; flex-direction: column; gap: 12px; }
  .testemunho { background: var(--bg); border-radius: 12px; padding: 16px; font-size: 13.5px; color: var(--text-soft); }
  .testemunho b { display: block; color: ${primary}; font-size: 13px; margin-top: 6px; }

  .contacto-box {
    background: ${primary}; color: ${secondary}; border-radius: 16px; padding: 32px 24px;
    text-align: center;
  }
  .contacto-box h2 { font-size: 19px; margin-bottom: 18px; }
  .btns { display: flex; flex-direction: column; gap: 10px; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px;
  }
  .btn-wa { background: #25D366; color: #fff; }
  .btn-alt { background: rgba(255,255,255,0.15); color: ${secondary}; border: 1px solid ${secondary}55; }

  footer { text-align: center; padding: 30px 20px; font-size: 12px; color: var(--footer-text); }
</style>
</head>
<body>

<div class="watermark-logo">${iniciais}</div>
<div class="watermark-d3na">D3NA</div>

<nav>
  <div class="marca">${logoBadgeHTML(logo_choice, iniciais, primary, secondary, fontFamily)} ${company_name}</div>
  <div class="direita">
    <button class="theme-btn" id="themeBtn" title="Alternar tema">🌙</button>
    <button class="menu-btn" onclick="document.getElementById('menuDrop').classList.toggle('on')">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="menu-drop" id="menuDrop">
    <span class="menu-d3na">D3NA</span>
    <a href="#sobre">Sobre</a>
    <a href="#contacto">Contacto</a>
    <div class="menu-ad-label">Publicidade</div>
    <div class="menu-ad-box">
      <div class="menu-ad-scale"><div class="menu-ad-inner"><script>
        atOptions = {
          'key' : 'c9711ff1dd4ba302fc1dd70f8133ab95',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      </script><script src="https://www.highrevenueformat.com/c9711ff1dd4ba302fc1dd70f8133ab95/invoke.js"></script></div></div>
    </div>
  </div>
</nav>

<header>
  <h1>${company_name}</h1>
  <p>${company_description ? company_description.slice(0, 60) : "Qualidade que se sente"}</p>
  <a class="hero-cta" href="#" onclick="event.preventDefault(); (document.getElementById('catalogo')||document.getElementById('galeria')||document.getElementById('sobre')||document.getElementById('contacto'))?.scrollIntoView({behavior:'smooth'});">Saiba mais ↓</a>
</header>

<section>
${corpo || `
  <div class="card reveal" id="sobre">
    <h2>Sobre nós</h2>
    <p>${company_description || "Descrição em breve."}</p>
  </div>

  <div class="card reveal">
    <h2>O que dizem os clientes</h2>
    <div class="testemunhos">
      <div class="testemunho">"Atendimento rápido e produto de qualidade." <b>— Cliente satisfeito</b></div>
      <div class="testemunho">"Recomendo a todos, superou as expectativas." <b>— Cliente satisfeito</b></div>
    </div>
  </div>
`}

  ${adsCarouselHTML()}

  <div class="contacto-box reveal" id="contacto">
    <h2>Fale connosco</h2>
    <div class="btns">
      ${renderContactBtns(contact_links)}
    </div>
  </div>
</section>

<footer>Site criado com D3NA</footer>

<script>
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("on"); });
  }, { threshold: 0.15 });
  els.forEach((el) => obs.observe(el));

  document.addEventListener("click", (ev) => {
    const drop = document.getElementById("menuDrop");
    const btn = document.querySelector(".menu-btn");
    if (drop.classList.contains("on") && !drop.contains(ev.target) && !btn.contains(ev.target)) {
      drop.classList.remove("on");
    }
  });

  const themeBtn = document.getElementById("themeBtn");
  function aplicarTema(escuro) {
    document.body.classList.toggle("dark", escuro);
    themeBtn.textContent = escuro ? "☀️" : "🌙";
  }
  const guardado = localStorage.getItem("d3na_theme");
  aplicarTema(guardado === "dark");
  themeBtn.addEventListener("click", () => {
    const escuro = !document.body.classList.contains("dark");
    aplicarTema(escuro);
    localStorage.setItem("d3na_theme", escuro ? "dark" : "light");
  });
  ${adsCarouselScript()}
</script>

${(() => {
  const wa = (contact_links || []).find((c) => c.platform === "whatsapp");
  const alvo = wa ? wa.link : "#contacto";
  const externo = wa ? `target="_blank"` : "";
  return `<a class="cta-flutuante" href="${alvo}" ${externo}><span class="cta-icone"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="${secondary}" d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.21L4 22l5.15-1.49c.92.24 1.88.37 2.85.37 5.52 0 10-4.03 10-9S17.52 2 12 2zm-2.5 10.5h-2V10h2v2.5zm4 0h-2V10h2v2.5zm4 0h-2V10h2v2.5z"/></svg></span>Fale connosco</a>`;
})()}
</body>
</html>`;
}

export function gerarEstrutura1(dados) {
  const {
    company_name = "O Meu Negócio", company_description = "",
    business_type = "", color_scheme = "azul", style_choice = 1,
    logo_choice = 1, contact_links = [], font_choice = "sistema",
  } = dados;

  const { primary, secondary } = getColors(color_scheme);
  const fontFamily = getFontFamily(font_choice);
  const iniciais = company_name.slice(0, 2).toUpperCase();
  const d = { company_name, company_description, business_type, contact_links, logo_choice };

  const geradores = {
    1: estilo1,
    2: estilo2,
    3: estilo3,
    4: estilo4,
    5: estilo5,
  };
  const gerar = geradores[style_choice] || estilo3;

  return gerar(d, primary, secondary, iniciais, undefined, fontFamily);
}
