import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { C } from "../tokens.js";

export default function GalleryItemsPicker({ value, onChange }) {
  const [aberto, setAberto] = useState(false);
  const [imagemUrl, setImagemUrl] = useState("");
  const [legenda, setLegenda] = useState("");

  function adicionar() {
    if (!imagemUrl.trim()) return;
    onChange([...value, { image_url: imagemUrl.trim(), caption: legenda.trim() }]);
    setImagemUrl("");
    setLegenda("");
    setAberto(false);
  }

  function remover(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 6 };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 8 };

  return (
    <div style={{ marginTop: 4, marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>Fotos da galeria:</div>

      {value.map((item, i) => (
        <div key={i} style={row}>
          <div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>📷 Foto {i + 1}</div>
            {item.caption && <div style={{ fontSize: 11.5, color: C.inkSoft }}>{item.caption}</div>}
          </div>
          <button onClick={() => remover(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, flexShrink: 0, marginLeft: 8 }}>
            <X size={16} />
          </button>
        </div>
      ))}

      {!aberto && (
        <button onClick={() => setAberto(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${C.border}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: C.navy, fontSize: 13, width: "100%", justifyContent: "center" }}>
          <Plus size={15} /> Adicionar foto
        </button>
      )}

      {aberto && (
        <div style={{ marginTop: 6 }}>
          <input
            autoFocus
            placeholder="Link da imagem (hospedada onde quiseres)"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Legenda (opcional)"
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={adicionar} style={{ flex: 1, background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Adicionar</button>
            <button onClick={() => { setAberto(false); setImagemUrl(""); setLegenda(""); }} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px", fontSize: 13, cursor: "pointer", color: C.inkSoft }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
