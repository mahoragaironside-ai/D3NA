import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../tokens.js";

export default function OptionPicker({ items, selectedId, onSelect, renderItem, getLabel }) {
  let idx = items.findIndex((i) => i.id === selectedId);
  if (idx === -1) idx = 0;
  const atual = items[idx];

  useEffect(() => {
    if (!items.find((i) => i.id === selectedId) && items.length > 0) {
      onSelect(items[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function ir(delta) {
    const novoIdx = (idx + delta + items.length) % items.length;
    onSelect(items[novoIdx].id);
  }

  const navCircle = {
    width: 40, height: 40, borderRadius: "50%", border: "none",
    background: C.navySoft, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, color: C.navy, transition: "transform 0.15s ease",
  };

  // mostra no máximo 9 pontos (com reticências implícitas via opacidade) para não
  // ficar uma fileira infinita quando há muitas opções (ex: 30 cores/logos)
  const maxPontos = 9;
  let pontosIdx = items.map((_, i) => i);
  if (items.length > maxPontos) {
    const metade = Math.floor(maxPontos / 2);
    let inicio = Math.max(0, idx - metade);
    let fim = Math.min(items.length, inicio + maxPontos);
    inicio = Math.max(0, fim - maxPontos);
    pontosIdx = pontosIdx.slice(inicio, fim);
  }

  return (
    <div style={{ marginTop: 10, marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => ir(-1)} style={navCircle} type="button" aria-label="Anterior">
          <ChevronLeft size={19} />
        </button>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          padding: "22px 14px 16px", borderRadius: 18,
          background: `linear-gradient(165deg, ${C.surface} 0%, ${C.bg} 100%)`,
          border: `1px solid ${C.border}`,
          boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
        }}>
          {atual && renderItem(atual)}
          <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 700, marginTop: 2 }}>{getLabel ? getLabel(atual) : atual?.label}</div>
          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
            {pontosIdx.map((i) => (
              <span
                key={i}
                style={{
                  width: i === idx ? 14 : 5, height: 5, borderRadius: 3,
                  background: i === idx ? C.navy : C.border,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>
        <button onClick={() => ir(1)} style={navCircle} type="button" aria-label="Seguinte">
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}
