import { logoBadgeCSS, logoBadgeHTML } from "./logoBadge.js";
import { adsCarouselCSS, adsCarouselHTML, adsCarouselScript } from "./adsCarousel.js";
import { catalogoCSS } from "./catalogo.js";
import { galeriaCSS } from "./galeria.js";

const ICONES = {
  whatsapp: "💬", instagram: "📸", tiktok: "🎵",
  facebook: "👍", telefone: "📞", outro: "🔗",
};

function renderContactBtns(contactLinks) {
  if (!contactLinks || contactLinks.length === 0) return "";
  return contactLinks.map((c) => {
    const alvo = c.link.startsWith("tel:") ? "" : `target="_blank"`;
    return `<a class="btn" href="${c.link}" ${alvo}>${ICONES[c.platform] || "🔗"} ${c.label}</a>`;
  }).join("\n      ");
}

export function estilo5(dados, primary, secondary, iniciais, corpo) {
  const { company_name, company_description, business_type, contact_links, logo_choice } = dados;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${company_name}</title>
<style>
  :root {
    --bg: #f4f4f6; --card-bg: #ffffff; --text: #1a1a1a; --text-soft: #666;
    --nav-bg: #ffffff; --nav-border: #eaeaea; --footer-text: #999;
    --shadow: 0 10px 24px rgba(0,0,0,0.10);
  }
  body.dark {
    --bg: #141414; --card-bg: #202020; --text: #f0f0f0; --text-soft: #b0b0b0;
    --nav-bg: #1a1a1a; --nav-border: #2c2c2c; --footer-text: #777;
    --shadow: 0 10px 24px rgba(0,0,0,0.4);
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
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: var(--text); line-height: 1.6; background: var(--bg); transition: background 0.3s, color 0.3s; }

  ${logoBadgeCSS(logo_choice, primary, secondary)}
  ${adsCarouselCSS(primary)}

  .cta-flutuante {
    position: fixed; bottom: 20px; right: 16px; z-index: 40;
    display: flex; align-items: center; gap: 8px;
    background: ${primary}; color: ${secondary}; text-decoration: none;
    padding: 13px 18px; border-radius: 30px; font-weight: 700; font-size: 13.5px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    animation: ctaEntrar 0.5s ease 1s both;
  }
  .cta-flutuante:active { transform: scale(0.96); }
  @keyframes ctaEntrar { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  ${catalogoCSS(primary)}
  ${galeriaCSS(primary)}

  nav {
    position: sticky; top: 0; z-index: 20;
    background: var(--nav-bg); border-bottom: 1px solid var(--nav-border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; transition: background 0.3s, border-color 0.3s;
  }
  nav .marca { display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--text); }
  nav .direita { display: flex; align-items: center; gap: 4px; }

  .theme-btn, .menu-btn { background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; }
  .menu-btn { flex-direction: column; gap:4px; }
  .menu-btn span { width:20px; height:2px; background: var(--text); display:block; border-radius:2px; }

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
    padding: 40px 20px 20px; text-align: center;
  }
  header .badge {
    display: inline-block; background: ${primary}22; color: ${primary}; border-radius: 20px;
    padding: 6px 16px; font-size: 12px; margin-bottom: 14px; font-weight: 600;
  }
  header h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
  header p { font-size: 14px; color: var(--text-soft); max-width: 460px; margin: 0 auto; }

  .reveal { opacity: 0; transform: translateY(14px); transition: all 0.6s ease; }
  .reveal.on { opacity: 1; transform: translateY(0); }

  section { max-width: 680px; margin: 0 auto; padding: 10px 16px 50px; }
  .card {
    background: var(--card-bg); border-radius: 18px; padding: 24px;
    box-shadow: var(--shadow); margin-bottom: 16px;
  }
  .card h2 { font-size: 17px; color: var(--text); margin-bottom: 12px; font-weight: 800; }
  .card p { font-size: 14px; color: var(--text-soft); }

  .testemunhos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .testemunho { background: var(--bg); border-radius: 14px; padding: 14px; font-size: 12.5px; color: var(--text-soft); }
  .testemunho b { display: block; color: ${primary}; font-size: 12px; margin-top: 8px; }

  .contacto-box {
    background: var(--card-bg); border-radius: 18px; padding: 26px 22px;
    text-align: center; box-shadow: var(--shadow);
  }
  .contacto-box h2 { font-size: 17px; margin-bottom: 16px; font-weight: 800; }
  .btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 13px 8px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 13px;
    background: ${primary}; color: ${secondary};
  }

  footer { text-align: center; padding: 26px 20px; font-size: 12px; color: var(--footer-text); }
</style>
</head>
<body>

<div class="watermark-logo">${iniciais}</div>
<div class="watermark-d3na">D3NA</div>

<nav>
  <div class="marca">${logoBadgeHTML(logo_choice, iniciais)} ${company_name}</div>
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
  <div class="badge">${business_type}</div>
  <h1>${company_name}</h1>
  <p>${company_description ? company_description.slice(0, 60) : "Tudo o que precisa, num só lugar"}</p>
</header>

<section>  ${corpo || `
<div class="card reveal" id="sobre">
    <h2>Sobre nós</h2>
    <p>${company_description || "Descrição em breve."}</p>
  </div>

  <div class="card reveal">
    <h2>O que dizem os clientes</h2>
    <div class="testemunhos-grid">
      <div class="testemunho">"Atendimento rápido e produto de qualidade."<b>Cliente satisfeito</b></div>
      <div class="testemunho">"Recomendo a todos, superou as expectativas."<b>Cliente satisfeito</b></div>
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
  return `<a class="cta-flutuante" href="${alvo}" ${externo}>💬 Fale connosco</a>`;
})()}
</body>
</html>`;
}
