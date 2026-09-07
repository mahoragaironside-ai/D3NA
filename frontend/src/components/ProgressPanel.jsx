import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { C } from "../tokens.js";

const GROUP_LABEL = { objective: "objetivo", capital: "capital", product: "produto", costs: "custos", demand: "procura", risk: "riscos" };

function groupOf(key) {
  if (key === "objective") return "objective";
  if (["capital_total", "essential_expenses", "committed_money"].includes(key)) return "capital";
  if (["product_name", "unit_price", "quantity", "sale_price"].includes(key)) return "product";
  if (["shipping_cost", "taxes_known", "other_costs"].includes(key)) return "costs";
  if (key === "demand_evidence_level") return "demand";
  if (["using_essential_money", "supplier_trust"].includes(key)) return "risk";
  return null;
}

export default function ProgressPanel({ memory }) {
  const groups = Object.keys(GROUP_LABEL);
  const filled = (g) => Object.keys(memory).some((k) => groupOf(k) === g);
  const pct = Math.round((groups.filter(filled).length / groups.length) * 100);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: C.inkSoft, textTransform: "uppercase" }}>Análise em curso</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: C.border, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.navy, transition: "width .4s ease" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {groups.map((g) => (
          <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: filled(g) ? C.ink : C.inkSoft }}>
            {filled(g) ? <CheckCircle2 size={15} color={C.green} /> : <Circle size={15} color={C.border} />}
            <span style={{ textTransform: "capitalize" }}>{GROUP_LABEL[g]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
