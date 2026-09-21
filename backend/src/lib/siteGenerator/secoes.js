import { catalogoHTML } from "./catalogo.js";
import { galeriaHTML } from "./galeria.js";

export const ICONES = {
  whatsapp: `<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path fill="#FFFFFF" d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5 0 1.2.3 2.3.9 3.3L5.5 18.5l3.3-.9c1 .5 2.1.9 3.2.9 3.6 0 6.5-2.9 6.5-6.5S15.6 5.5 12 5.5zm3.8 9.2c-.2.4-.9.8-1.3.9-.3.1-.7.1-1.1 0-.3-.1-.6-.2-1-.4-1.8-.8-3-2.6-3.1-2.7-.1-.1-.7-1-.7-1.9s.5-1.3.6-1.5c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .5.4.2.4.6 1.4.7 1.5.1.1.1.3 0 .4-.1.1-.1.2-.2.4-.1.1-.2.2-.3.4-.1.1-.2.3-.1.5.2.2.7 1.1 1.5 1.8 1 .9 1.9 1.2 2.1 1.3.2.1.3.1.5-.1.1-.2.6-.7.8-.9.2-.2.4-.2.6-.1l1.6.8c.2.1.3.1.4.2.1.2.1.7-.1 1.1z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FEDA75"/><stop offset="30%" stop-color="#D62976"/><stop offset="60%" stop-color="#962FBF"/><stop offset="100%" stop-color="#4F5BD5"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#igGrad)"/><rect x="6.5" y="6.5" width="11" height="11" rx="3.5" fill="none" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="16.3" cy="7.7" r="1.1" fill="#FFFFFF"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#FFFFFF" d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.3 1.4-1.3h1.5V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.4v2.8h2.4V21h2.7z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#000000"/><circle cx="8.4" cy="16.6" r="3" fill="#FE2C55" opacity="0.7"/><circle cx="9.6" cy="15.4" r="3" fill="#25F4EE" opacity="0.7"/><circle cx="9" cy="16" r="3" fill="#FFFFFF"/><rect x="10.5" y="4" width="2" height="12" fill="#FFFFFF"/><path d="M12.5 4c.5 2.2 2.2 3.9 4.5 4.3v2.2c-1.7-.1-3.2-.8-4.5-1.8z" fill="#FFFFFF"/></svg>`,
  telefone: "📞",
  outro: "🔗",
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

export function secaoGaleria(items) {
  return `
  <div class="card reveal" id="galeria">
    <h2>Galeria</h2>
    ${galeriaHTML(items)}
  </div>`;
}
