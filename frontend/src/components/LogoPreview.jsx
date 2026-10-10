import React from "react";
import { C } from "../tokens.js";
import OptionPicker from "./OptionPicker.jsx";

function textoSVG(L1, L2, cor1, cor2) {
  return `<text x="20" y="30" text-anchor="middle" font-weight="800" font-size="20" fill="${cor1}">${L1}</text><text x="44" y="30" text-anchor="middle" font-weight="800" font-size="20" fill="${cor2}">${L2}</text>`;
}

const FORMAS = {
  quadrado: (fill) => `<rect x="2" y="2" width="60" height="60" rx="16" fill="${fill}"/>`,
  circulo: (fill) => `<circle cx="32" cy="32" r="30" fill="${fill}"/>`,
  hexagono: (fill) => `<polygon points="32,3 58,17 58,47 32,61 6,47 6,17" fill="${fill}"/>`,
  octogono: (fill) => `<polygon points="20,3 44,3 61,20 61,44 44,61 20,61 3,44 3,20" fill="${fill}"/>`,
  diamante: (fill) => `<rect x="14" y="14" width="36" height="36" rx="7" fill="${fill}" transform="rotate(45 32 32)"/>`,
  escudo: (fill) => `<path d="M32 3 L58 13 V35 C58 50 46 59 32 62 C18 59 6 50 6 35 V13 Z" fill="${fill}"/>`,
  fita: (fill) => `<path d="M5 6 H59 V46 L32 60 L5 46 Z" fill="${fill}"/>`,
  paralelogramo: (fill) => `<polygon points="16,4 62,4 48,60 2,60" fill="${fill}"/>`,
  cantocortado: (fill) => `<path d="M18 2 H62 V46 L46 62 H2 V18 Z" fill="${fill}"/>`,
  arco: (fill) => `<path d="M2 62 V32 A30 30 0 0 1 62 32 V62 Z" fill="${fill}"/>`,
  balao: (fill) => `<path d="M4 4 H60 A4 4 0 0 1 64 8 V40 A4 4 0 0 1 60 44 H28 L16 58 L18 44 H8 A4 4 0 0 1 4 40 Z" fill="${fill}"/>`,
  camadas: (fill) => `<rect x="8" y="10" width="48" height="48" rx="12" fill="${fill}" opacity="0.4"/><rect x="2" y="4" width="48" height="48" rx="12" fill="${fill}"/>`,
};

function clipPorForma(forma) {
  const clips = {
    quadrado: (n) => `<clipPath id="cl${n}"><rect x="2" y="2" width="60" height="60" rx="16"/></clipPath>`,
    circulo: (n) => `<clipPath id="cl${n}"><circle cx="32" cy="32" r="30"/></clipPath>`,
    hexagono: (n) => `<clipPath id="cl${n}"><polygon points="32,3 58,17 58,47 32,61 6,47 6,17"/></clipPath>`,
    octogono: (n) => `<clipPath id="cl${n}"><polygon points="20,3 44,3 61,20 61,44 44,61 20,61 3,44 3,20"/></clipPath>`,
  };
  return clips[forma] || clips.quadrado;
}

function construirSVG(forma, modo, primary, secondary, L1, L2, n) {
  const f = FORMAS[forma] || FORMAS.quadrado;
  if (modo === "solido") {
    return `<svg viewBox="0 0 64 64" width="100%" height="100%">${f(primary)}${textoSVG(L1, L2, secondary, secondary)}</svg>`;
  }
  if (modo === "gradiente") {
    return `<svg viewBox="0 0 64 64" width="100%" height="100%"><defs><linearGradient id="g${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs>${f(`url(#g${n})`)}${textoSVG(L1, L2, "#fff", "#fff")}</svg>`;
  }
  if (modo === "contorno") {
    return `<svg viewBox="0 0 64 64" width="100%" height="100%">${f("none").replace(/fill="none"/, `fill="none" stroke="${primary}" stroke-width="2.5"`)}${textoSVG(L1, L2, primary, primary)}</svg>`;
  }
  if (modo === "bicolor") {
    const clip = clipPorForma(forma)(n);
    return `<svg viewBox="0 0 64 64" width="100%" height="100%"><defs>${clip}</defs><g clip-path="url(#cl${n})"><rect x="0" y="0" width="32" height="64" fill="${primary}"/><rect x="32" y="0" width="32" height="64" fill="${secondary}"/></g>${textoSVG(L1, L2, secondary, primary)}</svg>`;
  }
  return `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="32" cy="32" r="31" fill="${primary}" opacity="0.18"/>${f("#fff").replace(/fill="#fff"/, `fill="#fff" stroke="${primary}" stroke-width="1.5"`)}${textoSVG(L1, L2, primary, primary)}</svg>`;
}

const VARIANTES = [
  { id: 1, forma: "quadrado", modo: "solido", anim: "logoPulse", label: "Quadrado" },
  { id: 2, forma: "circulo", modo: "solido", anim: "logoPing", label: "Círculo" },
  { id: 3, forma: "hexagono", modo: "solido", anim: "logoFloat", label: "Hexágono" },
  { id: 4, forma: "octogono", modo: "gradiente", anim: "logoGradient", label: "Octógono gradiente" },
  { id: 5, forma: "escudo", modo: "solido", anim: "logoPulse", label: "Escudo" },
  { id: 6, forma: "fita", modo: "solido", anim: "logoSlide", label: "Fita" },
  { id: 7, forma: "paralelogramo", modo: "solido", anim: "logoPulse", label: "Paralelogramo" },
  { id: 8, forma: "cantocortado", modo: "solido", anim: "logoFloat", label: "Canto cortado" },
  { id: 9, forma: "arco", modo: "solido", anim: "logoPulse", label: "Arco" },
  { id: 10, forma: "balao", modo: "solido", anim: "logoBounce", label: "Balão de fala" },
  { id: 11, forma: "quadrado", modo: "contorno", anim: "logoPulse", label: "Quadrado contorno" },
  { id: 12, forma: "circulo", modo: "contorno", anim: "logoPing", label: "Círculo contorno" },
  { id: 13, forma: "hexagono", modo: "contorno", anim: "logoFloat", label: "Hexágono contorno" },
  { id: 14, forma: "quadrado", modo: "bicolor", anim: "logoSlide", label: "Quadrado bicolor" },
  { id: 15, forma: "circulo", modo: "bicolor", anim: "logoSlide", label: "Círculo bicolor" },
  { id: 16, forma: "octogono", modo: "bicolor", anim: "logoSlide", label: "Octógono bicolor" },
  { id: 17, forma: "hexagono", modo: "bicolor", anim: "logoSlide", label: "Hexágono bicolor" },
  { id: 18, forma: "quadrado", modo: "gradiente", anim: "logoGradient", label: "Quadrado gradiente" },
  { id: 19, forma: "circulo", modo: "gradiente", anim: "logoGradient", label: "Círculo gradiente" },
  { id: 20, forma: "escudo", modo: "gradiente", anim: "logoGradient", label: "Escudo gradiente" },
  { id: 21, forma: "fita", modo: "gradiente", anim: "logoGradient", label: "Fita gradiente" },
  { id: 22, forma: "quadrado", modo: "halo", anim: "logoPing", label: "Quadrado halo" },
  { id: 23, forma: "circulo", modo: "halo", anim: "logoPing", label: "Círculo halo" },
  { id: 24, forma: "diamante", modo: "solido", anim: "logoPulse", label: "Diamante" },
  { id: 25, forma: "diamante", modo: "gradiente", anim: "logoGradient", label: "Diamante gradiente" },
  { id: 26, forma: "diamante", modo: "contorno", anim: "logoPulse", label: "Diamante contorno" },
  { id: 27, forma: "octogono", modo: "solido", anim: "logoPulse", label: "Octógono" },
  { id: 28, forma: "paralelogramo", modo: "gradiente", anim: "logoGradient", label: "Paralelogramo gradiente" },
  { id: 29, forma: "arco", modo: "gradiente", anim: "logoGradient", label: "Arco gradiente" },
  { id: 30, forma: "camadas", modo: "solido", anim: "logoFloat", label: "Camadas" },
];

export default function LogoPreview({ name, primary, secondary, selected, onSelect }) {
  const letras = (name || "D3").trim().slice(0, 2).toUpperCase();
  const L1 = letras[0] || "D";
  const L2 = letras[1] || "3";

  return (
    <div>
      <style>{`
        @keyframes logoPulse { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        @keyframes logoPing { 0% { filter:drop-shadow(0 0 0 rgba(0,0,0,0.3)); } 70% { filter:drop-shadow(0 0 6px rgba(0,0,0,0)); } 100% { filter:drop-shadow(0 0 0 rgba(0,0,0,0)); } }
        @keyframes logoFloat { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
        @keyframes logoSlide { 0%, 100% { transform:translateX(0); } 50% { transform:translateX(2px); } }
        @keyframes logoGradient { 0%, 100% { filter:brightness(1); } 50% { filter:brightness(1.12); } }
        @keyframes logoBounce { 0%, 100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-2px) rotate(-2deg); } }
      `}</style>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 2 }}>Escolhe o teu logo:</div>
      <OptionPicker
        items={VARIANTES}
        selectedId={selected}
        onSelect={onSelect}
        getLabel={(v) => v.label}
        renderItem={(v) => (
          <div
            style={{ width: 56, height: 56, animation: `${v.anim} 2.2s ease-in-out infinite` }}
            dangerouslySetInnerHTML={{ __html: construirSVG(v.forma, v.modo, primary, secondary, L1, L2, v.id) }}
          />
        )}
      />
    </div>
  );
}
