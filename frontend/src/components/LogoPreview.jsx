import React from "react";
import { C } from "../tokens.js";

const VARIANTES = [
  { id: 1, label: "Minimal" },
  { id: 2, label: "Clássico" },
  { id: 3, label: "Moderno" },
  { id: 4, label: "Editorial" },
  { id: 5, label: "Loja" },
];

export default function LogoPreview({ name, primary, secondary, selected, onSelect }) {
  const letras = (name || "D3").trim().slice(0, 2).toUpperCase();
  const L1 = letras[0] || "D";
  const L2 = letras[1] || "3";

  const wrap = { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 4, marginTop: 14, marginBottom: 6 };
  const box = (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    cursor: "pointer", padding: 3, borderRadius: 8, minWidth: 0,
    border: `2px solid ${active ? C.navy : "transparent"}`,
    background: active ? C.navySoft : "transparent",
  });
  const label = { fontSize: 8.5, color: C.inkSoft, textAlign: "center", lineHeight: 1.1 };
  const mark = { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" };

  function renderMark(id) {
    if (id === 1) return (
      <div style={{ ...mark, background: primary, borderRadius: 11 }}>
        <span style={{ color: secondary, fontWeight: 900, fontSize: 15, letterSpacing: -2 }}>{L1}{L2}</span>
      </div>
    );
    if (id === 2) return (
      <div style={{ ...mark, borderRadius: 11, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, background: primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: secondary, fontWeight: 800, fontSize: 13 }}>{L1}</span>
        </div>
        <div style={{ flex: 1, background: secondary, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${primary}` }}>
          <span style={{ color: primary, fontWeight: 800, fontSize: 13 }}>{L2}</span>
        </div>
      </div>
    );
    if (id === 3) return (
      <div style={{ ...mark, background: "#fff", borderRadius: "50%", border: `2px solid ${primary}` }}>
        <span style={{ fontSize: 13, fontWeight: 800 }}>
          <span style={{ color: primary, WebkitTextStroke: `1px ${primary}`, WebkitTextFillColor: "transparent" }}>{L1}</span>
          <span style={{ color: primary }}>{L2}</span>
        </span>
      </div>
    );
    if (id === 4) return (
      <div style={mark}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, color: primary, borderBottom: `2px solid ${primary}`, paddingBottom: 1 }}>
          {L1}{L2.toLowerCase()}
        </span>
      </div>
    );
    return (
      <div style={{ ...mark, position: "relative" }}>
        <span style={{ position: "absolute", fontSize: 15, fontWeight: 900, color: primary, opacity: 0.35, transform: "translate(2px, 2px)" }}>{L1}{L2}</span>
        <span style={{ position: "relative", fontSize: 15, fontWeight: 900, color: primary }}>{L1}{L2}</span>
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
