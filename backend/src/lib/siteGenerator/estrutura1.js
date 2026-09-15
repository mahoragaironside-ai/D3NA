import { getColors } from "../colors.js";
import { logoBadgeCSS, logoBadgeHTML } from "./logoBadge.js";

function whatsappLink(contact, companyName) {
  const numero = contact.replace(/\D/g, "");
  const msg = encodeURIComponent(`Olá! Vi o site da ${companyName} e gostava de saber mais.`);
  return `https://wa.me/244${numero}?text=${msg}`;
}

function estilo3(dados, primary, secondary, iniciais) {
  const { company_name, company_description, contact_info, business_type } = dados;
  const wa = whatsappLink(contact_info, company_name);

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${company_name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #fff; }

  ${logoBadgeCSS(3, primary, secondary)}

  nav {
    position: sticky; top: 0; z-index: 20;
    background: #fff; border-bottom: 1px solid #eee;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
  }
  nav .marca { display: flex; align-items: center; gap: 10px; font-weight: 700; color: ${primary}; }

  .menu-btn { background:none; border:none; cursor:pointer; padding:6px; display:flex; flex-direction:column; gap:4px; }
  .menu-btn span { width:20px; height:2px; background:${primary}; display:block; border-radius:2px; }

  .menu-drop {
    position: absolute; top: 56px; right: 16px; background:#fff;
    border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    padding: 8px; display: none; flex-direction: column; min-width: 160px; z-index: 30;
  }
  .menu-drop.on { display: flex; }
  .menu-drop a { padding: 10px 14px; color:#333; text-decoration:none; font-size:14px; border-radius:8px; }
  .menu-drop a:active { background:#f2f2f2; }

  header {
    background: linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%);
    color: ${secondary};
    padding: 70px 20px 90px;
    text-align: center;
  }
  header h1 { font-size: 30px; font-weight: 800; margin-bottom: 8px; }
  header p { font-size: 15px; opacity: 0.9; }
  header .badge {
    display: inline-block; background: rgba(255,255,255,0.18); border-radius: 20px;
    padding: 6px 16px; font-size: 12px; margin-bottom: 16px; letter-spacing: 0.5px;
  }

  .reveal { opacity: 0; transform: translateY(18px); transition: all 0.6s ease; }
  .reveal.on { opacity: 1; transform: translateY(0); }

  section { max-width: 680px; margin: -40px auto 0; padding: 0 20px 50px; position: relative; }
  .card {
    background: #fff; border-radius: 16px; padding: 28px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08); margin-bottom: 20px;
  }
  .card h2 { font-size: 19px; color: ${primary}; margin-bottom: 12px; font-weight: 800; }
  .card p { font-size: 14.5px; color: #555; }

  .testemunhos { display: flex; flex-direction: column; gap: 12px; }
  .testemunho { background: #F7F7F9; border-radius: 12px; padding: 16px; font-size: 13.5px; color: #444; }
  .testemunho b { display: block; color: ${primary}; font-size: 13px; margin-top: 6px; }

  .contacto-box {
    background: ${primary}; color: ${secondary}; border-radius: 16px; padding: 32px 24px;
    text-align: center;
  }
  .contacto-box h2 { font-size: 19px; margin-bottom: 6px; }
  .contacto-box p { opacity: 0.85; font-size: 13.5px; margin-bottom: 18px; }
  .btns { display: flex; flex-direction: column; gap: 10px; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px;
  }
  .btn-wa { background: #25D366; color: #fff; }
  .btn-tel { background: rgba(255,255,255,0.15); color: ${secondary}; border: 1px solid ${secondary}55; }

  footer { text-align: center; padding: 30px 20px; font-size: 12px; color: #999; }
  footer .redes { margin-bottom: 8px; font-size: 12px; color: #bbb; }
</style>
</head>
<body>

<nav>
  <div class="marca">${logoBadgeHTML(iniciais)} ${company_name}</div>
  <button class="menu-btn" onclick="document.getElementById('menuDrop').classList.toggle('on')">
    <span></span><span></span><span></span>
  </button>
  <div class="menu-drop" id="menuDrop">
    <a href="#sobre">Sobre</a>
    <a href="#contacto">Contacto</a>
  </div>
</nav>

<header>
  <div class="badge">${business_type}</div>
  <h1>${company_name}</h1>
  <p>${company_description ? company_description.slice(0, 60) : "Qualidade que se sente"}</p>
</header>

<section>
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

  <div class="contacto-box reveal" id="contacto">
    <h2>Fale connosco</h2>
    <p>${contact_info}</p>
    <div class="btns">
      <a class="btn btn-wa" href="${wa}" target="_blank">WhatsApp</a>
      <a class="btn btn-tel" href="tel:${contact_info.replace(/\s/g, "")}">Ligar agora</a>
    </div>
  </div>
</section>

<footer>
  <div class="redes">Redes sociais em breve</div>
  Site criado com D3NA
</footer>

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
</script>

</body>
</html>`;
}

function estiloSimples(dados, primary, secondary, iniciais) {
  const { company_name, company_description, contact_info, business_type } = dados;
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${company_name}</title><style>
* { box-sizing: border-box; margin:0; padding:0; }
body { font-family: -apple-system, sans-serif; color:#222; line-height:1.6; }
header { background:${primary}; color:${secondary}; padding:60px 20px; text-align:center; }
.logo-circulo { width:64px; height:64px; border-radius:50%; background:${secondary}; color:${primary};
  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; margin:0 auto 16px; }
section { max-width:640px; margin:0 auto; padding:48px 20px; }
section h2 { font-size:20px; color:${primary}; margin-bottom:14px; border-bottom:2px solid ${primary}; padding-bottom:8px; display:inline-block; }
.contacto { background:#F7F7F8; text-align:center; padding:48px 20px; }
.contacto a { display:inline-block; margin-top:16px; padding:12px 28px; background:${primary}; color:${secondary};
  text-decoration:none; border-radius:30px; font-weight:600; font-size:15px; }
footer { text-align:center; padding:20px; font-size:12px; color:#999; }
</style></head><body>
<header><div class="logo-circulo">${iniciais}</div><h1>${company_name}</h1><p>${business_type}</p></header>
<section><h2>Sobre nós</h2><p>${company_description || "Descrição em breve."}</p></section>
<div class="contacto"><h2 style="border:none;">Fale connosco</h2><p>${contact_info}</p>
<a href="tel:${contact_info.replace(/\s/g, "")}">Contactar agora</a></div>
<footer>Site criado com D3NA</footer></body></html>`;
}

export function gerarEstrutura1(dados) {
  const {
    company_name = "O Meu Negócio", company_description = "", contact_info = "",
    business_type = "", color_scheme = "azul", style_choice = 1,
  } = dados;

  const { primary, secondary } = getColors(color_scheme);
  const iniciais = company_name.slice(0, 2).toUpperCase();
  const d = { company_name, company_description, contact_info, business_type };

  if (style_choice === 3) return estilo3(d, primary, secondary, iniciais);
  return estiloSimples(d, primary, secondary, iniciais);
}
