import React from "react";
import { Menu, PenSquare, MessageSquare, Moon, Sun, GraduationCap } from "lucide-react";
import { C } from "../tokens.js";

export default function Sidebar({ open, onToggle, projects, currentId, onSelect, onNewConversation, me, subscription, onUpgrade, theme, onToggleTheme, onOpenCourse }) {
  const isPremium = subscription?.plan_name === "premium" && subscription?.subscription_status === "ativo";
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onToggle} />}
      <div className={`sidebar ${open ? "sidebar-open" : "sidebar-closed"}`}>
        <div style={{ padding: "12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onToggle} style={iconBtnStyle} title="Fechar barra lateral">
            <Menu size={18} color={C.ink} />
          </button>
          <button onClick={onToggleTheme} style={iconBtnStyle} title="Alternar tema">
            {theme === "dark" ? <Sun size={18} color={C.ink} /> : <Moon size={18} color={C.ink} />}
          </button>
        </div>

        <button
          onClick={onNewConversation}
          style={{
            margin: "4px 10px 12px", display: "flex", alignItems: "center", gap: 8,
            background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 12px",
            fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}
        >
          <PenSquare size={15} /> Nova consulta
        </button>

        {isPremium && (
          <button
            onClick={onOpenCourse}
            className="course-btn"
            style={{
              margin: "0 10px 12px", display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#8A5FE0,#5B7FE0)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 12px",
              fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            <GraduationCap size={16} /> Curso de Marketing Digital
          </button>
        )}

        <div style={{ padding: "0 10px 4px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.inkSoft, textTransform: "uppercase" }}>
          Conversas recentes
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 6px" }}>
          {projects.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", color: C.inkSoft, fontSize: 12.5 }}>Ainda não tens conversas.</div>
          )}
          {projects.map((p) => (
            <button
              key={p.project_id}
              onClick={() => onSelect(p.project_id)}
              style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                background: p.project_id === currentId ? C.navySoft : "transparent", border: "none",
                borderRadius: 8, padding: "9px 10px", cursor: "pointer", marginBottom: 2,
              }}
            >
              <MessageSquare size={14} color={p.project_id === currentId ? C.navy : C.inkSoft} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name || "Consultoria"}
              </span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, padding: 10 }}>
          {subscription?.subscription_status === "ativo" ? (
            <div style={{ width: "100%", textAlign: "center", background: C.greenBg, color: C.green, borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 600 }}>
              {subscription.plan_name === "premium" ? "Premium ativo" : "Consultoria ativa"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => onUpgrade("normal")} style={{ width: "100%", background: C.amberBg, color: C.amber, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Semanal — 600 Kz / 7 dias
              </button>
              <button onClick={() => onUpgrade("premium")} style={{ width: "100%", background: "linear-gradient(135deg,#8A5FE0,#5B7FE0)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Premium — 1.500 Kz / 7 dias
              </button>
            </div>
          )}
          {me && !me.phone_verified && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: C.inkSoft, textAlign: "center" }}>Telefone ainda não verificado</div>
          )}
        </div>
      </div>
    </>
  );
}

const iconBtnStyle = {
  width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
