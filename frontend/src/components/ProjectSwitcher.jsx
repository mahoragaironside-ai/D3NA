import React from "react";
import { X, MessageSquare } from "lucide-react";
import { C } from "../tokens.js";

export default function ProjectSwitcher({ projects, currentId, onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,24,31,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "60px 16px 16px", zIndex: 60 }}>
      <div style={{ background: C.surface, borderRadius: 16, width: 340, maxWidth: "100%", maxHeight: "70vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.ink }}>As tuas conversas</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.inkSoft} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: 8 }}>
          {projects.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: C.inkSoft, fontSize: 13 }}>Ainda não tens conversas.</div>
          )}
          {projects.map((p) => (
            <button
              key={p.project_id}
              onClick={() => onSelect(p.project_id)}
              style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                background: p.project_id === currentId ? C.navySoft : "transparent", border: "none",
                borderRadius: 10, padding: "10px 12px", cursor: "pointer", marginBottom: 4,
              }}
            >
              <MessageSquare size={16} color={p.project_id === currentId ? C.navy : C.inkSoft} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name || "Consultoria"}
                </div>
                <div style={{ fontSize: 11.5, color: C.inkSoft }}>
                  {p.category ? p.category + " · " : ""}{new Date(p.updated_at).toLocaleDateString("pt-PT")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
