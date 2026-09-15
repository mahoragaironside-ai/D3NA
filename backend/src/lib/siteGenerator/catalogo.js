export function catalogoCSS(primary) {
  return `
  .catalogo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .catalogo-item {
    background: var(--card-bg); border-radius: 14px; padding: 16px;
    box-shadow: var(--shadow, 0 4px 14px rgba(0,0,0,0.06));
  }
  .catalogo-item h3 { font-size: 14px; color: var(--text); margin-bottom: 4px; font-weight: 700; }
  .catalogo-item .preco { font-size: 15px; color: ${primary}; font-weight: 800; margin-bottom: 6px; }
  .catalogo-item p { font-size: 12px; color: var(--text-soft); line-height: 1.5; }
  @media (max-width: 380px) { .catalogo-grid { grid-template-columns: 1fr; } }
  `;
}

export function catalogoHTML(items) {
  if (!items || items.length === 0) {
    return `<p style="font-size:13px;color:var(--text-soft);text-align:center;">Catálogo em breve.</p>`;
  }
  const cartoes = items.map((item) => `
    <div class="catalogo-item">
      <h3>${item.name}</h3>
      <div class="preco">${item.price} Kz</div>
      ${item.description ? `<p>${item.description}</p>` : ""}
    </div>
  `).join("\n");

  return `<div class="catalogo-grid">${cartoes}</div>`;
}
