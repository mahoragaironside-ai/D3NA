import React from "react";
import { X, Copy, ExternalLink } from "lucide-react";
import { C, fmt } from "../tokens.js";

export default function PaymentModal({ info, onClose }) {
  const amount = Number(info.payment_amount || 600).toLocaleString("pt-PT", { minimumFractionDigits: 2 });

  function copyRef() {
    navigator.clipboard?.writeText(info.payment_reference);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,24,31,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
      <div style={{ background: C.surface, borderRadius: 16, width: 340, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 600 }}>Ref-X</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "Georgia, serif" }}>Pagamento por referência</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Ref-X">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif", color: C.ink, letterSpacing: 0.5 }}>
                {formatRef(info.payment_reference)}
              </span>
              <button onClick={copyRef} title="Copiar referência" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Copy size={14} color={C.inkSoft} />
              </button>
            </div>
          </Row>
          <Row label="Descrição">{info.payment_description || "Pagamento semanal"}</Row>
          <Row label="Valor">{amount} {info.payment_currency || "AOA"}</Row>

          <a
            href={info.payment_url}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 6, textAlign: "center", background: C.navy, color: "#fff", textDecoration: "none",
              borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            Pagar com FaciPay <ExternalLink size={14} />
          </a>

          <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>
            Pague esta Ref-X utilizando o teu FaciPay — basta colar e pagar. Depois de pagares,
            a tua consultoria é ativada assim que confirmarmos o pagamento (normalmente em
            algumas horas).
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
      <span style={{ fontSize: 12.5, color: C.inkSoft }}>{label}</span>
      <span style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function formatRef(ref) {
  if (!ref) return "";
  return String(ref).replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}
