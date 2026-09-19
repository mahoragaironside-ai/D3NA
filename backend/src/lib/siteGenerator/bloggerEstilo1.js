function escXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const CORES = {
  azul: { primary: "#2563eb", secondary: "#ffffff" },
  verde: { primary: "#16a34a", secondary: "#ffffff" },
  grafite: { primary: "#374151", secondary: "#ffffff" },
  vinho: { primary: "#9f1239", secondary: "#ffffff" },
};

const ICONES = {
  whatsapp: "💬", instagram: "📸", tiktok: "🎵",
  facebook: "👍", telefone: "📞", outro: "🔗",
};

function renderContactBtnsXML(contactLinks) {
  if (!contactLinks || contactLinks.length === 0) return "";
  return contactLinks.map((c) => {
    const link = escXml(c.link);
    const label = escXml(c.label);
    return `<a class='btn' href='${link}' target='_blank'>${ICONES[c.platform] || "🔗"} ${label}</a>`;
  }).join("\n        ");
}

export function bloggerEstilo1(dados) {
  const {
    company_name = "O Meu Negócio",
    company_description = "",
    business_type = "",
    color_scheme = "azul",
    contact_links = [],
  } = dados;

  const { primary, secondary } = CORES[color_scheme] || CORES.azul;
  const nome = escXml(company_name);
  const descricao = escXml(company_description || "Qualidade que se sente.");
  const tipo = escXml(business_type);
  const iniciais = escXml(company_name.slice(0, 2).toUpperCase());
  const contactosHTML = renderContactBtnsXML(contact_links);

  const cabecalho = `<?xml version="1.0" encoding="UTF-8" ?>
<html b:version='2' class='v2' expr:dir='data:blog.languageDirection'
      xmlns='http://www.w3.org/1999/xhtml'
      xmlns:b='http://www.google.com/2005/gml/b'
      xmlns:data='http://www.google.com/2005/gml/data'
      xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width,initial-scale=1.0' name='viewport'/>
  <title>${nome}</title>
  <b:include data='blog' name='all-head-content'/>
  <b:skin><![CDATA[
    :root {
      --bg: #ffffff; --card-bg: #ffffff; --text: #1a1a1a; --text-soft: #666;
      --nav-bg: #ffffff; --nav-border: #e5e5e5; --footer-text: #999; --linha: #e5e5e5;
    }
    body.dark {
      --bg: #101010; --card-bg: #101010; --text: #f0f0f0; --text-soft: #aaa;
      --nav-bg: #101010; --nav-border: #262626; --footer-text: #777; --linha: #262626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: var(--text); line-height: 1.7; background: var(--bg); transition: background 0.3s, color 0.3s; font-weight: 300; }
    nav { position: sticky; top: 0; z-index: 20; background: var(--nav-bg); border-bottom: 1px solid var(--nav-border); display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; }
    nav .marca { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--text); }
    .logo-badge { width: 34px; height: 34px; border-radius: 50%; background: ${primary}; color: ${secondary}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
    .theme-btn { background:none; border:none; cursor:pointer; padding:6px; font-size:16px; }
    header { padding: 60px 24px 40px; border-bottom: 1px solid var(--linha); }
    header .badge { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-soft); }
    header h1 { font-size: 30px; font-weight: 600; margin: 10px 0 8px; color: ${primary}; }
    header p { font-size: 14px; color: var(--text-soft); max-width: 480px; }
    section { max-width: 640px; margin: 0 auto; padding: 40px 24px; }
    .card { padding: 0 0 32px; margin-bottom: 32px; border-bottom: 1px solid var(--linha); }
    .card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-soft); margin-bottom: 14px; font-weight: 600; }
    .card p { font-size: 15px; color: var(--text); }
    .catalogo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .catalogo-item { background: var(--card-bg); border: 1px solid var(--linha); border-radius: 14px; overflow: hidden; }
    .catalogo-item img { width: 100%; height: 120px; object-fit: cover; display: block; }
    .catalogo-item .info { padding: 10px; }
    .catalogo-item h3 { font-size: 13px; color: var(--text); margin-bottom: 4px; font-weight: 700; }
    .catalogo-item p { font-size: 11.5px; color: var(--text-soft); }
    @media (max-width: 380px) { .catalogo-grid { grid-template-columns: 1fr; } }
    .contacto-box h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-soft); margin-bottom: 18px; font-weight: 600; }
    .btns { display: flex; flex-direction: column; gap: 10px; }
    .btn { display: flex; align-items: center; gap: 10px; padding: 14px 4px; border-bottom: 1px solid var(--linha); text-decoration: none; font-weight: 500; font-size: 14px; color: var(--text); }
    footer { text-align: left; padding: 30px 24px; font-size: 12px; color: var(--footer-text); border-top: 1px solid var(--linha); max-width: 640px; margin: 0 auto; }
  ]]></b:skin>
</head>
<body>

<nav>
  <div class='marca'><span class='logo-badge'>${iniciais}</span> ${nome}</div>
  <button class='theme-btn' id='themeBtn' title='Alternar tema'>🌙</button>
</nav>

<header>
  <div class='badge'>${tipo}</div>
  <h1>${nome}</h1>
  <p>${descricao}</p>
</header>

<section>

  <div class='card' id='sobre'>
    <h2>Sobre nós</h2>
    <p>${descricao}</p>
  </div>`;

  const corpo = `
  <b:section id='catalogo-section' class='catalogo' maxwidgets='1' showaddelement='no'>
    <b:widget id='Blog1' locked='false' title='Catálogo' type='Blog' version='2'>
      <b:includable id='main' var='this'>
        <div class='card' id='catalogo'>
          <h2>Catálogo</h2>
          <div class='catalogo-grid'>
            <b:loop values='data:this.posts' var='post'>
              <div class='catalogo-item'>
                <b:if cond='data:post.featuredImage'>
                  <img expr:src='data:post.featuredImage' expr:alt='data:post.title'/>
                </b:if>
                <div class='info'>
                  <h3><a expr:href='data:post.url' style='color:inherit;text-decoration:none;'><data:post.title/></a></h3>
                  <p><data:post.snippet/></p>
                </div>
              </div>
            </b:loop>
          </div>
        </div>
      </b:includable>
    </b:widget>
  </b:section>

  <div class='card contacto-box' id='contacto'>
    <h2>Fale connosco</h2>
    <div class='btns'>
      ${contactosHTML}
    </div>
  </div>

</section>

<footer>Site criado com D3NA</footer>

<script>
//<![CDATA[
  var themeBtn = document.getElementById('themeBtn');
  function aplicarTema(escuro) {
    document.body.classList.toggle('dark', escuro);
    themeBtn.textContent = escuro ? '☀️' : '🌙';
  }
  var guardado = localStorage.getItem('d3na_theme');
  aplicarTema(guardado === 'dark');
  themeBtn.addEventListener('click', function () {
    var escuro = !document.body.classList.contains('dark');
    aplicarTema(escuro);
    localStorage.setItem('d3na_theme', escuro ? 'dark' : 'light');
  });
//]]>
</script>

</body>
</html>`;

  return cabecalho + corpo;
}
