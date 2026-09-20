export function catalogoCSS(primary) {
  return `
  .catalogo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .catalogo-item {
    background: var(--card-bg); border-radius: 14px; padding: 16px; cursor: pointer;
    box-shadow: var(--shadow, 0 4px 14px rgba(0,0,0,0.06)); transition: transform 0.15s ease;
  }
  .catalogo-item:active { transform: scale(0.97); }
  .catalogo-img { width: 100%; aspect-ratio: 1; border-radius: 10px; background-size: cover; background-position: center; margin-bottom: 10px; background-color: var(--bg); }
  .catalogo-item h3 { font-size: 14px; color: var(--text); margin-bottom: 4px; font-weight: 700; }
  .catalogo-item .preco { font-size: 15px; color: ${primary}; font-weight: 800; margin-bottom: 6px; }
  .catalogo-item p { font-size: 12px; color: var(--text-soft); line-height: 1.5; }
  @media (max-width: 380px) { .catalogo-grid { grid-template-columns: 1fr; } }

  .catalogo-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 50;
    display: none; align-items: center; justify-content: center; padding: 20px;
  }
  .catalogo-modal.on { display: flex; }
  .catalogo-modal-content {
    background: var(--card-bg); border-radius: 16px; padding: 20px; max-width: 340px; width: 100%;
    position: relative; max-height: 85vh; overflow-y: auto;
  }
  .catalogo-modal-close {
    position: absolute; top: 10px; right: 10px; background: var(--bg); border: none; border-radius: 50%;
    width: 30px; height: 30px; font-size: 15px; cursor: pointer; color: var(--text);
  }
  .catalogo-modal-img { width: 100%; aspect-ratio: 1; border-radius: 12px; background-size: cover; background-position: center; margin-bottom: 12px; background-color: var(--bg); display: none; }
  .catalogo-modal-content h3 { font-size: 17px; color: var(--text); margin-bottom: 6px; }
  .catalogo-modal-content .preco { font-size: 16px; color: ${primary}; font-weight: 800; margin-bottom: 10px; }
  .catalogo-modal-content p { font-size: 13.5px; color: var(--text-soft); line-height: 1.6; }
  `;
}

export function catalogoHTML(items) {
  if (!items || items.length === 0) {
    return `<p style="font-size:13px;color:var(--text-soft);text-align:center;">Catálogo em breve.</p>`;
  }

  const cartoes = items.map((item, i) => `
    <div class="catalogo-item" onclick="abrirCatalogoItem(${i})">
      ${item.image_url ? `<div class="catalogo-img" style="background-image:url('${item.image_url}')"></div>` : ""}
      <h3>${item.name}</h3>
      <div class="preco">${item.price} Kz</div>
      ${item.description ? `<p>${item.description}</p>` : ""}
    </div>
  `).join("\n");

  const dadosJson = JSON.stringify(items).replace(/<\/script/gi, "<\\/script");

  return `<div class="catalogo-grid">${cartoes}</div>
  <div class="catalogo-modal" id="catalogoModal" onclick="if(event.target===this) fecharCatalogoItem()">
    <div class="catalogo-modal-content">
      <button class="catalogo-modal-close" onclick="fecharCatalogoItem()">✕</button>
      <div class="catalogo-modal-img" id="catalogoModalImg"></div>
      <h3 id="catalogoModalNome"></h3>
      <div class="preco" id="catalogoModalPreco"></div>
      <p id="catalogoModalDesc"></p>
    </div>
  </div>
  <script>
    window.__catalogoItems = ${dadosJson};
    function abrirCatalogoItem(i) {
      const item = window.__catalogoItems[i];
      if (!item) return;
      document.getElementById("catalogoModalNome").textContent = item.name;
      document.getElementById("catalogoModalPreco").textContent = item.price + " Kz";
      document.getElementById("catalogoModalDesc").textContent = item.description || "";
      const img = document.getElementById("catalogoModalImg");
      if (item.image_url) {
        img.style.backgroundImage = "url('" + item.image_url + "')";
        img.style.display = "block";
      } else {
        img.style.display = "none";
      }
      document.getElementById("catalogoModal").classList.add("on");
    }
    function fecharCatalogoItem() {
      document.getElementById("catalogoModal").classList.remove("on");
    }
  </script>`;
}
