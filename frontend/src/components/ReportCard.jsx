import React from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { C, fmt } from "../tokens.js";

export default function ReportCard({ report }) {
  const toneColors = {
    red: { bg: C.redBg, fg: C.red },
    amber: { bg: C.amberBg, fg: C.amber },
    green: { bg: C.greenBg, fg: C.green },
  };
  const tc = toneColors[report.tone];
  const { numbers, scenarios } = report;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: tc.bg, padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: tc.fg, textTransform: "uppercase", marginBottom: 4 }}>Decisão</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, color: C.ink }}>{report.decisionLabel}</div>
      </div>

      <Section label="Por quê"><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.ink }}>{report.reason}</p></Section>

      <Section label="Números principais">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat label="Capital disponível" value={fmt(numbers.capitalDisponivel)} />
          <Stat label="Investimento total" value={fmt(numbers.investimentoTotal)} />
          <Stat label="Custo real / unidade" value={fmt(numbers.custoRealUnidade)} />
          <Stat label="Exposição de capital" value={isFinite(numbers.exposicao) ? numbers.exposicao.toFixed(0) + "%" : "—"} />
          <Stat label="Margem estimada" value={numbers.margem !== undefined ? numbers.margem.toFixed(1) + "%" : "por confirmar"} />
          <Stat label="Lucro estimado" value={numbers.lucro !== undefined ? fmt(numbers.lucro) : "por confirmar"} />
        </div>
      </Section>

      {report.missing.length > 0 && (
        <Section label="O que ainda não sabemos">
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>
            {report.missing.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Section>
      )}

      <Section label="Riscos principais">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {report.risks.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <RiskDot level={r.level} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{r.name} <span style={{ fontWeight: 400, color: C.inkSoft }}>· {r.level}</span></div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {scenarios && (
        <Section label="Cenários (simulação, não previsão)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <ScenarioCol icon={<TrendingUp size={14} color={C.green} />} label="Positivo" data={scenarios.positivo} />
            <ScenarioCol icon={<Minus size={14} color={C.amber} />} label="Moderado" data={scenarios.moderado} />
            <ScenarioCol icon={<TrendingDown size={14} color={C.red} />} label="Negativo" data={scenarios.negativo} />
          </div>
        </Section>
      )}

      <Section label="O que fazer agora" noBorder>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {report.nextActions.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: C.ink }}>
              <ChevronRight size={15} color={C.navy} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children, noBorder }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: noBorder ? "none" : `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: C.inkSoft }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: "Georgia, serif" }}>{value}</div>
    </div>
  );
}
function RiskDot({ level }) {
  const color = level === "alto" ? C.red : level === "médio" ? C.amber : level === "desconhecido" ? C.inkSoft : C.green;
  return <div style={{ width: 8, height: 8, borderRadius: 99, background: color, marginTop: 5, flexShrink: 0 }} />;
}
function ScenarioCol({ icon, label, data }) {
  return (
    <div style={{ background: C.bg, borderRadius: 10, padding: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        {icon}<span style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft }}>{label}</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.ink }}>Receita: {fmt(data.receita)}</div>
      <div style={{ fontSize: 12.5, color: data.lucro >= 0 ? C.green : C.red, fontWeight: 600 }}>
        {data.lucro >= 0 ? "Lucro" : "Prejuízo"}: {fmt(Math.abs(data.lucro))}
      </div>
    </div>
  );
}
