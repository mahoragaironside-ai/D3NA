import React from "react";
import { C } from "../tokens.js";

const VARIANTES = [
  { id: 1, label: "Minimalista" },
  { id: 2, label: "Clássico" },
  { id: 3, label: "Moderno" },
  { id: 4, label: "Editorial" },
  { id: 5, label: "Cartão/loja" },
];

export default function LogoPreview({ name, primary, secondary, selected, onSelect }) {
  const letras = (name || "D3").trim().slice(0, 2).toUpperCase();
  const L1 = letras[0] || "D";
  const L2 = letras[1] || "3";

  const wrap = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 14, marginBottom: 6 };
  const box = (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    cursor: "pointer", padding: 4, borderRadius: 10,
    border: `2px solid ${active ? C.navy : "transparent"}`,
    background: active ? C.navySoft : "transparent",
  });
  const label = { fontSize: 10, color: C.inkSoft, textAlign: "center" };
  const mark = { width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" };

  function renderMark(id) {
    if (id === 1) return (
      <div style={{ ...mark, background: primary, borderRadius: 14 }}>
        <span style={{ color: secondary, fontWeight: 900, fontSize: 20, letterSpacing: -3 }}>{L1}{L2}</span>
      </div>
    );
    if (id === 2) return (
      <div style={{ ...mark, borderRadius: 14, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, background: primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: secondary, fontWeight: 800, fontSize: 18 }}>{L1}</span>
        </div>
        <div style={{ flex: 1, background: secondary, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${primary}` }}>
          <span style={{ color: primary, fontWeight: 800, fontSize: 18 }}>{L2}</span>
        </div>
      </div>
    );
    if (id === 3) return (
      <div style={{ ...mark, background: "#fff", borderRadius: "50%", border: `2px solid ${primary}` }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>
          <span style={{ color: primary, WebkitTextStroke: `1px ${primary}`, WebkitTextFillColor: "transparent" }}>{L1}</span>
          <span style={{ color: primary }}>{L2}</span>
        </span>
      </div>
    );
    if (id === 4) return (
      <div style={mark}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 24, color: primary, borderBottom: `2px solid ${primary}`, paddingBottom: 2 }}>
          {L1}{L2.toLowerCase()}
        </span>
      </div>
    );
    return (
      <div style={{ ...mark, position: "relative" }}>
        <span style={{ position: "absolute", fontSize: 20, fontWeight: 900, color: primary, opacity: 0.35, transform: "translate(3px, 3px)" }}>{L1}{L2}</span>
        <span style={{ position: "relative", fontSize: 20, fontWeight: 900, color: primary }}>{L1}{L2}</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 4 }}>Escolhe o teu logo:</div>
      <div style={wrap}>
        {VARIANTES.map((v) => (
          <div key={v.id} style={box(selected === v.id)} onClick={() => onSelect(v.id)}>
            {renderMark(v.id)}
            <span style={label}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
