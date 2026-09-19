export function galeriaCSS(primary) {
  return `
  .galeria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .galeria-item { border-radius: 14px; overflow: hidden; box-shadow: var(--shadow, 0 4px 14px rgba(0,0,0,0.06)); aspect-ratio: 1; }
  .galeria-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  `;
}

export function galeriaHTML(items) {
  if (!items || items.length === 0) {
    return `<p style="font-size:13px;color:var(--text-soft);text-align:center;">Galeria em breve.</p>`;
  }
  const fotos = items.map((item) => `
    <div class="galeria-item">
      <img src="${item.image_url}" alt="${item.caption || ""}" loading="lazy">
    </div>
  `).join("\n");

  return `<div class="galeria-grid">${fotos}</div>`;
}
