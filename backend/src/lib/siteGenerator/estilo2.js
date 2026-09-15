import { logoBadgeCSS, logoBadgeHTML } from "./logoBadge.js";
import { adsCarouselCSS, adsCarouselHTML, adsCarouselScript } from "./adsCarousel.js";

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

export function estilo2(dados, primary, secondary, iniciais, corpo) {
  const { company_name, company_description, business_type, contact_links, logo_choice } = dados;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${company_name}</title>
<style>
  :root {
    --bg: #faf7f2; --card-bg: #fffdfa; --text: #2b2620; --text-soft: #6b6255;
    --nav-bg: #fffdfa; --nav-border: #e8dfd0; --footer-text: #a39a89;
    --shadow: 0 6px 20px rgba(60,45,20,0.08); --linha: #e8dfd0;
  }
  body.dark {
    --bg: #1c1712; --card-bg: #241e17; --text: #f2ece0; --text-soft: #c2b6a0;
    --nav-bg: #241e17; --nav-border: #3a3226; --footer-text: #8a7d68;
    --shadow: 0 6px 20px rgba(0,0,0,0.4); --linha: #3a3226;
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
  body { font-family: Georgia, 'Times New Roman', serif; color: var(--text); line-height: 1.7; background: var(--bg); transition: background 0.3s, color 0.3s; }

  ${logoBadgeCSS(logo_choice, primary, secondary)}
  ${adsCarouselCSS(primary)}

  nav {
    position: sticky; top: 0; z-index: 20;
    background: var(--nav-bg); border-bottom: 2px solid ${primary};
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; transition: background 0.3s, border-color 0.3s;
  }
  nav .marca { display: flex; align-items: center; gap: 10px; font-weight: 700; color: ${primary}; letter-spacing: 0.5px; }
  nav .direita { display: flex; align-items: center; gap: 4px; }

  .theme-btn, .menu-btn { background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; }
  .menu-btn { flex-direction: column; gap:4px; }
  .menu-btn span { width:20px; height:2px; background:${primary}; display:block; }

  .menu-drop {
    position: absolute; top: 58px; right: 16px; background: var(--card-bg);
    border: 1px solid var(--linha); border-radius: 4px; box-shadow: var(--shadow);
    padding: 8px; display: none; flex-direction: column; min-width: 340px; max-width: calc(100vw - 32px); z-index: 30;
  }
  .menu-drop.on { display: flex; }
  .menu-drop a { padding: 10px 14px; color: var(--text); text-decoration:none; font-size:14px; }
  .menu-ad-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-soft); margin: 8px 14px 4px; }
  .menu-ad-box { padding: 4px 14px 10px; overflow: hidden; }

  header {
    padding: 60px 20px; text-align: center; border-bottom: 1px solid var(--linha);
  }
  header .badge {
    display: inline-block; border: 1px solid ${primary}; color: ${primary}; border-radius: 2px;
    padding: 5px 14px; font-size: 11px; margin-bottom: 18px; letter-spacing: 1.5px; text-transform: uppercase;
  }
  header h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
  header p { font-size: 14.5px; color: var(--text-soft); font-style: italic; max-width: 480px; margin: 0 auto; }

  .reveal { opacity: 0; transform: translateY(16px); transition: all 0.6s ease; }
  .reveal.on { opacity: 1; transform: translateY(0); }

  section { max-width: 660px; margin: 0 auto; padding: 40px 20px 50px; }
  .card {
    background: var(--card-bg); border: 1px solid var(--linha); padding: 30px;
    margin-bottom: 24px; box-shadow: var(--shadow);
  }
  .card h2 { font-size: 18px; color: ${primary}; margin-bottom: 14px; font-weight: 700; border-bottom: 1px solid var(--linha); padding-bottom: 10px; }
  .card p { font-size: 14.5px; color: var(--text-soft); }

  .testemunhos { display: flex; flex-direction: column; gap: 16px; }
  .testemunho { font-size: 14px; color: var(--text-soft); font-style: italic; padding-left: 14px; border-left: 3px solid ${primary}; }
  .testemunho b { display: block; color: var(--text); font-style: normal; font-size: 12.5px; margin-top: 6px; }

  .contacto-box {
    background: var(--card-bg); border: 2px solid ${primary}; padding: 32px 24px; text-align: center;
  }
  .contacto-box h2 { font-size: 18px; color: ${primary}; margin-bottom: 18px; font-weight: 700; }
  .btns { display: flex; flex-direction: column; gap: 10px; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px; border: 1px solid ${primary}; text-decoration: none; font-weight: 700; font-size: 14px; color: ${primary};
  }

  footer { text-align: center; padding: 28px 20px; font-size: 12px; color: var(--footer-text); }
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
      <script>
        atOptions = {
          'key' : 'c9711ff1dd4ba302fc1dd70f8133ab95',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      </script><script src="https://www.highrevenueformat.com/c9711ff1dd4ba302fc1dd70f8133ab95/invoke.js"></script>
    </div>
  </div>
</nav>

<header>
  <div class="badge">${business_type}</div>
  <h1>${company_name}</h1>
  <p>${company_description ? company_description.slice(0, 70) : "Tradição e qualidade em cada detalhe"}</p>
</header>

<section>  ${corpo || `
<div class="card reveal" id="sobre">
    <h2>Sobre nós</h2>
    <p>${company_description || "Descrição em breve."}</p>
  </div>

  <div class="card reveal">
    <h2>O que dizem os clientes</h2>
    <div class="testemunhos">
      <div class="testemunho">"Atendimento rápido e produto de qualidade." <b>Cliente satisfeito</b></div>
      <div class="testemunho">"Recomendo a todos, superou as expectativas." <b>Cliente satisfeito</b></div>
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

</body>
</html>`;
}
