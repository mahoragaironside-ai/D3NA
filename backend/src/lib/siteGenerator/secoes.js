import { catalogoHTML } from "./catalogo.js";

const ICONES = {
  whatsapp: "💬", instagram: "📸", tiktok: "🎵",
  facebook: "👍", telefone: "📞", outro: "🔗",
};

export function renderContactBtns(contactLinks) {
  if (!contactLinks || contactLinks.length === 0) return "";
  return contactLinks.map((c) => {
    const alvo = c.link.startsWith("tel:") ? "" : `target="_blank"`;
    return `<a class="btn" href="${c.link}" ${alvo}>${ICONES[c.platform] || "🔗"} ${c.label}</a>`;
  }).join("\n      ");
}

export function secaoSobre(description) {
  return `
  <div class="card reveal" id="sobre">
    <h2>Sobre nós</h2>
    <p>${description || "Descrição em breve."}</p>
  </div>`;
}

export function secaoTestemunhos(gridClass) {
  const cls = gridClass || "testemunhos";
  return `
  <div class="card reveal">
    <h2>O que dizem os clientes</h2>
    <div class="${cls}">
      <div class="testemunho">"Atendimento rápido e produto de qualidade."<b>Cliente satisfeito</b></div>
      <div class="testemunho">"Recomendo a todos, superou as expectativas."<b>Cliente satisfeito</b></div>
    </div>
  </div>`;
}

export function secaoCatalogo(items) {
  return `
  <div class="card reveal" id="catalogo">
    <h2>Catálogo</h2>
    ${catalogoHTML(items)}
  </div>`;
}
