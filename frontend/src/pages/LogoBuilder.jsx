import React, { useState, useEffect } from "react";
import { C } from "../tokens.js";
import { LOGO_TEMPLATES, LOGO_FONTS, LOGO_KEYFRAMES } from "../components/logoTemplates.js";

const CORES = [
  { id: "azul", primary: "#16305C", secondary: "#FFFFFF", label: "Azul & Branco" },
  { id: "verde", primary: "#1E7A52", secondary: "#F5F6F8", label: "Verde & Cinza claro" },
  { id: "grafite", primary: "#15181F", secondary: "#E0AA4E", label: "Grafite & Dourado" },
  { id: "vinho", primary: "#7A1E2E", secondary: "#FFFFFF", label: "Vinho & Branco" },
  { id: "terracota", primary: "#B24C2B", secondary: "#FFF6EF", label: "Terracota & Creme" },
  { id: "roxo", primary: "#4B2E83", secondary: "#F5F0FA", label: "Roxo & Lilás claro" },
  { id: "petroleo", primary: "#0D3B3E", secondary: "#E7F4F3", label: "Petróleo & Turquesa claro" },
  { id: "mostarda", primary: "#8A6A14", secondary: "#FFFBF0", label: "Mostarda & Creme" },
  { id: "coral", primary: "#C94A38", secondary: "#FFF8F6", label: "Coral & Branco suave" },
  { id: "preto", primary: "#0A0A0A", secondary: "#FFFFFF", label: "Preto & Branco" },
];

export default function LogoBuilder() {
  const [companyName, setCompanyName] = useState("");
  const [acronymMode, setAcronymMode] = useState(false);
  const [templateId, setTemplateId] = useState(LOGO_TEMPLATES[0].id);
  const [fontId, setFontId] = useState(LOGO_FONTS[0].id);
  const [colorId, setColorId] = useState(CORES[0].id);
  const [shapeDrawerOpen, setShapeDrawerOpen] = useState(false);
  const [fontDrawerOpen, setFontDrawerOpen] = useState(false);

  useEffect(() => {
    const families = LOGO_FONTS.filter((f) => f.google).map((f) => `family=${f.google}`).join("&");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const words = companyName.trim().split(/\s+/).filter(Boolean);
  const twoLetters = (companyName.trim().slice(0, 2) || "D3").toUpperCase();
  const acronym = (words.map((w) => w[0]).join("").slice(0, 4) || "D3").toUpperCase();
  const initials = acronymMode && words.length > 1 ? acronym : twoLetters;

  const template = LOGO_TEMPLATES.find((t) => t.id === templateId) || LOGO_TEMPLATES[0];
  const font = LOGO_FONTS.find((f) => f.id === fontId) || LOGO_FONTS[0];
  const color = CORES.find((c) => c.id === colorId) || CORES[0];

  const wrap = { minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", display: "flex", justifyContent: "center", padding: "16px 12px" };
  const card = { background: C.surface, borderRadius: 16, padding: 18, width: 420, maxWidth: "100%", boxSizing: "border-box" };
  const title = { fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 4 };
  const subtitle = { fontSize: 12.5, color: C.inkSoft, marginBottom: 12 };
  const fieldLabel = { fontSize: 12, color: C.inkSoft, fontWeight: 600, marginTop: 16, marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14 };
  const navBtn = { background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const ghostBtn = { ...navBtn, background: C.surface, color: C.navy, border: `1px solid ${C.navy}` };

  return (
    <div style={wrap}>
      <style>{LOGO_KEYFRAMES}</style>
      <div style={card}>
        <div style={title}>Construtor de logótipo</div>
        <div style={subtitle}>Escolhe o nome, a forma, a tipografia e as cores.</div>

        <label style={fieldLabel}>Nome da empresa</label>
        <input
          style={inputStyle}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Ex: Soldadura Industrial Esmael"
        />

        {words.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button type="button" onClick={() => setAcronymMode(false)} style={{ ...ghostBtn, padding: "6px 10px", fontSize: 12, background: !acronymMode ? C.navySoft : C.surface }}>
              Primeiras letras ({twoLetters})
            </button>
            <button type="button" onClick={() => setAcronymMode(true)} style={{ ...ghostBtn, padding: "6px 10px", fontSize: 12, background: acronymMode ? C.navySoft : C.surface }}>
              Iniciais das palavras ({acronym})
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <div style={{ width: 120, height: 120 }}>
            {template.render({ uid: "preview", primary: color.primary, secondary: color.secondary, initials, font: font.family })}
          </div>
        </div>

        <label style={fieldLabel}>Forma</label>
        <button type="button" onClick={() => setShapeDrawerOpen((v) => !v)} style={{ ...ghostBtn, width: "100%" }}>
          {template.label} — {shapeDrawerOpen ? "fechar" : "escolher outra"}
        </button>
        {shapeDrawerOpen && (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "10px 2px", marginTop: 8 }}>
            {LOGO_TEMPLATES.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setTemplateId(t.id);
                  setShapeDrawerOpen(false);
                }}
                style={{
                  flex: "0 0 auto", width: 60, height: 60, borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${t.id === templateId ? C.navy : "transparent"}`, padding: 2,
                }}
              >
                {t.render({ uid: `drawer-${t.id}`, primary: color.primary, secondary: color.secondary, initials, font: font.family })}
              </div>
            ))}
          </div>
        )}

        <label style={fieldLabel}>Tipografia</label>
        <button type="button" onClick={() => setFontDrawerOpen((v) => !v)} style={{ ...ghostBtn, width: "100%" }}>
          {font.label} — {fontDrawerOpen ? "fechar" : "escolher outra"}
        </button>
        {fontDrawerOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, maxHeight: 180, overflowY: "auto" }}>
            {LOGO_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFontId(f.id);
                  setFontDrawerOpen(false);
                }}
                style={{
                  textAlign: "left", background: f.id === fontId ? C.navySoft : "transparent", border: "none",
                  borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontFamily: f.family, fontSize: 15, color: C.ink,
                }}
              >
                {initials} <span style={{ fontFamily: "-apple-system, sans-serif", fontSize: 11, color: C.inkSoft }}>— {f.label}</span>
              </button>
            ))}
          </div>
        )}

        <label style={fieldLabel}>Cores</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CORES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColorId(c.id)}
              title={c.label}
              style={{
                width: 28, height: 28, borderRadius: "50%", cursor: "pointer", padding: 0,
                border: `2px solid ${c.id === colorId ? C.navy : "transparent"}`,
                background: c.primary,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
