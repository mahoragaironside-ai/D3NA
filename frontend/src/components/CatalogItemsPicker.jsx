import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { C } from "../tokens.js";

export default function CatalogItemsPicker({ value, onChange }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");

  function adicionar() {
    if (!nome.trim() || !preco.trim()) return;
    onChange([...value, { name: nome.trim(), price: preco.trim(), description: descricao.trim(), image_url: imagemUrl.trim() }]);
    setNome("");
    setPreco("");
    setDescricao("");
    setImagemUrl("");
    setAberto(false);
  }

  function remover(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 6 };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 8 };

  return (
    <div style={{ marginTop: 4, marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>Itens do catálogo:</div>

      {value.map((item, i) => (
        <div key={i} style={row}>
          <div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{item.name} — {item.price} Kz</div>
            {item.description && <div style={{ fontSize: 11.5, color: C.inkSoft }}>{item.description}</div>}
            {item.image_url && <div style={{ fontSize: 10.5, color: C.inkSoft }}>📷 com imagem</div>}
          </div>
          <button onClick={() => remover(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, flexShrink: 0, marginLeft: 8 }}>
            <X size={16} />
          </button>
        </div>
      ))}

      {!aberto && (
        <button onClick={() => setAberto(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${C.border}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: C.navy, fontSize: 13, width: "100%", justifyContent: "center" }}>
          <Plus size={15} /> Adicionar item
        </button>
      )}

      {aberto && (
        <div style={{ marginTop: 6 }}>
          <input
            autoFocus
            placeholder="Nome do produto/serviço"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Preço (Kz)"
            value={preco}
            onChange={(e) => setPreco(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            style={inputStyle}
          />
          <textarea
            placeholder="Descrição curta (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ ...inputStyle, minHeight: 60, resize: "none" }}
          />
          <input
            placeholder="Link da imagem (opcional — hospedada onde quiseres)"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={adicionar} style={{ flex: 1, background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Adicionar</button>
            <button onClick={() => { setAberto(false); setNome(""); setPreco(""); setDescricao(""); }} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px", fontSize: 13, cursor: "pointer", color: C.inkSoft }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
