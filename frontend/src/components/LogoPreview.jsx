import React from "react";
import { C } from "../tokens.js";
import OptionPicker from "./OptionPicker.jsx";

const VARIANTES = [
  { id: 1, label: "Minimal" },
  { id: 2, label: "Clássico" },
  { id: 3, label: "Moderno" },
  { id: 4, label: "Editorial" },
  { id: 5, label: "Loja" },
  { id: 6, label: "Gradiente" },
  { id: 7, label: "Contorno" },
];

export default function LogoPreview({ name, primary, secondary, selected, onSelect }) {
  const letras = (name || "D3").trim().slice(0, 2).toUpperCase();
  const L1 = letras[0] || "D";
  const L2 = letras[1] || "3";
  const mark = { width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" };

  function renderMark(id) {
    if (id === 1) return (
      <div style={{ ...mark, background: primary, borderRadius: 15, animation: "logoPreviewPulse 2.2s ease-in-out infinite" }}>
        <span style={{ color: secondary, fontWeight: 900, fontSize: 20, letterSpacing: -2 }}>{L1}{L2}</span>
      </div>
    );
    if (id === 2) return (
      <div style={{ ...mark, borderRadius: 15, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, background: primary, display: "flex", alignItems: "center", justifyContent: "center", animation: "logoPreviewBounce 1.8s ease-in-out infinite" }}>
          <span style={{ color: secondary, fontWeight: 800, fontSize: 17 }}>{L1}</span>
        </div>
        <div style={{ flex: 1, background: secondary, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${primary}`, animation: "logoPreviewBounce 1.8s ease-in-out infinite", animationDelay: "0.3s" }}>
          <span style={{ color: primary, fontWeight: 800, fontSize: 17 }}>{L2}</span>
        </div>
      </div>
    );
    if (id === 3) return (
      <div style={{ ...mark, background: "#fff", borderRadius: "50%", border: `2px solid ${primary}`, animation: "logoPreviewPing 2s ease-out infinite" }}>
        <span style={{ fontSize: 17, fontWeight: 800 }}>
          <span style={{ color: primary, WebkitTextStroke: `1px ${primary}`, WebkitTextFillColor: "transparent" }}>{L1}</span>
          <span style={{ color: primary }}>{L2}</span>
        </span>
      </div>
    );
    if (id === 4) return (
      <div style={{ ...mark, overflow: "hidden" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: primary, borderBottom: `2px solid ${primary}`, paddingBottom: 1, display: "inline-block", animation: "logoPreviewSlide 1.8s ease-in-out infinite" }}>
          {L1}{L2.toLowerCase()}
        </span>
      </div>
    );
    if (id === 5) return (
      <div style={{ ...mark, position: "relative" }}>
        <span style={{ position: "absolute", fontSize: 19, fontWeight: 900, color: primary, opacity: 0.35, animation: "logoPreviewFloat 2.4s ease-in-out infinite" }}>{L1}{L2}</span>
        <span style={{ position: "relative", fontSize: 19, fontWeight: 900, color: primary }}>{L1}{L2}</span>
      </div>
    );
    if (id === 6) return (
      <div style={{
        ...mark, borderRadius: 15, color: "#fff",
        background: `linear-gradient(120deg, ${primary}, ${secondary}, ${primary})`,
        backgroundSize: "200% 200%", animation: "logoPreviewGradient 3s ease infinite",
      }}>
        <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: -1, textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>{L1}{L2}</span>
      </div>
    );
    return (
      <div style={{ ...mark, position: "relative", background: "#fff", borderRadius: "50%" }}>
        <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `2px dashed ${primary}`, animation: "logoPreviewSpin 6s linear infinite" }} />
        <span style={{ position: "relative", color: primary, fontWeight: 800, fontSize: 17 }}>{L1}{L2}</span>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes logoPreviewPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes logoPreviewBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes logoPreviewPing { 0% { box-shadow: 0 0 0 0 ${primary}66; } 70% { box-shadow: 0 0 0 6px ${primary}00; } 100% { box-shadow: 0 0 0 0 ${primary}00; } }
        @keyframes logoPreviewSlide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
        @keyframes logoPreviewFloat { 0%, 100% { transform: translate(2px, 2px); opacity: 0.35; } 50% { transform: translate(4px, 4px); opacity: 0.55; } }
        @keyframes logoPreviewGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes logoPreviewSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 2 }}>Escolhe o teu logo:</div>
      <OptionPicker
        items={VARIANTES}
        selectedId={selected}
        onSelect={onSelect}
        renderItem={(v) => renderMark(v.id)}
      />
    </div>
  );
}
