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
    width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`,
    background: C.surface, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, color: C.ink,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, marginBottom: 6 }}>
      <button onClick={() => ir(-1)} style={navCircle} type="button">
        <ChevronLeft size={18} />
      </button>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "16px 10px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.bg,
      }}>
        {atual && renderItem(atual)}
        <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 600 }}>{getLabel ? getLabel(atual) : atual?.label}</div>
        <div style={{ fontSize: 10.5, color: C.inkSoft }}>{idx + 1} de {items.length}</div>
      </div>
      <button onClick={() => ir(1)} style={navCircle} type="button">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
