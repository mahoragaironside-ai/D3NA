import React, { useState } from "react";
import { Plus, X, MessageCircle, Instagram, Facebook, Phone, Link as LinkIcon, Music2 } from "lucide-react";
import { C } from "../tokens.js";

const PLATAFORMAS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25D366", placeholder: "923 456 789" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E1306C", placeholder: "teu.usuario" },
  { id: "tiktok", label: "TikTok", icon: Music2, color: "#111", placeholder: "teu.usuario" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2", placeholder: "teu.usuario ou página" },
  { id: "telefone", label: "Telefone", icon: Phone, color: "#555", placeholder: "923 456 789" },
  { id: "outro", label: "Outro link", icon: LinkIcon, color: "#888", placeholder: "https://..." },
];

function gerarLink(platformId, valor) {
  const v = valor.trim();
  if (platformId === "whatsapp") {
    const digitos = v.replace(/\D/g, "");
    const numero = digitos.length <= 9 ? `244${digitos}` : digitos;
    return `https://wa.me/${numero}`;
  }
  if (platformId === "telefone") return `tel:${v.replace(/\s/g, "")}`;
  if (platformId === "instagram") return `https://instagram.com/${v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")}`;
  if (platformId === "tiktok") return `https://tiktok.com/@${v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "")}`;
  if (platformId === "facebook") return v.startsWith("http") ? v : `https://facebook.com/${v}`;
  return v.startsWith("http") ? v : `https://${v}`;
}

export default function ContactLinksPicker({ value, onChange }) {
  const [aberto, setAberto] = useState(false);
  const [plataformaActiva, setPlataformaActiva] = useState(null);
  const [texto, setTexto] = useState("");

  function adicionar() {
    if (!plataformaActiva || !texto.trim()) return;
    const link = gerarLink(plataformaActiva.id, texto);
    onChange([...value, { platform: plataformaActiva.id, label: plataformaActiva.label, value: texto.trim(), link }]);
    setPlataformaActiva(null);
    setTexto("");
    setAberto(false);
  }

  function remover(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 6 };
  const platBtn = { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 6px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 10, color: C.ink };

  return (
    <div style={{ marginTop: 4, marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>Contactos:</div>

      {value.map((c, i) => {
        const p = PLATAFORMAS.find((pl) => pl.id === c.platform) || PLATAFORMAS[5];
        const Icon = p.icon;
        return (
          <div key={i} style={row}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={16} color={p.color} />
              <span style={{ fontSize: 13, color: C.ink }}>{c.value}</span>
            </div>
            <button onClick={() => remover(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft }}>
              <X size={16} />
            </button>
          </div>
        );
      })}

      {!aberto && (
        <button onClick={() => setAberto(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${C.border}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: C.navy, fontSize: 13, width: "100%", justifyContent: "center" }}>
          <Plus size={15} /> Adicionar contacto
        </button>
      )}

      {aberto && !plataformaActiva && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
          {PLATAFORMAS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} style={platBtn} onClick={() => setPlataformaActiva(p)}>
                <Icon size={18} color={p.color} />
                {p.label}
              </div>
            );
          })}
        </div>
      )}

      {aberto && plataformaActiva && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 4 }}>{plataformaActiva.label}</div>
          <input
            autoFocus
            placeholder={plataformaActiva.placeholder}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={adicionar} style={{ flex: 1, background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Adicionar</button>
            <button onClick={() => { setPlataformaActiva(null); setTexto(""); }} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px", fontSize: 13, cursor: "pointer", color: C.inkSoft }}>Voltar</button>
          </div>
        </div>
      )}
    </div>
  );
}
