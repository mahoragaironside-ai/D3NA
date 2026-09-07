import React, { useEffect, useState } from "react";
import { X, Clock, CheckCircle2 } from "lucide-react";
import { api } from "../api.js";
import { C } from "../tokens.js";

const COUNTDOWN_SECONDS = 20;

export default function AdBreak({ onClose, onCredited }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adStatus().then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  async function claim() {
    setClaiming(true);
    setError("");
    try {
      const result = await api.adWatched();
      setStatus(result);
      setSecondsLeft(COUNTDOWN_SECONDS);
      if (result.ad_credits > 0) {
        onCredited?.();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setClaiming(false);
    }
  }

  const readyToClaim = secondsLeft === 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,24,31,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 70 }}>
      <div style={{ background: C.surface, borderRadius: 16, width: 340, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.ink }}>Consulta extra grátis</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.inkSoft} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 12px", lineHeight: 1.5 }}>
            Vê {status ? status.views_needed : 5} anúncio(s) para desbloqueares uma consulta extra este mês —
            ou ativa um plano para consultas ilimitadas.
          </p>

          <div style={{ background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 10, height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: C.inkSoft, fontSize: 12.5, textAlign: "center", padding: 12 }}>
            [ espaço do anúncio — id="ad-zone-container" ]
          </div>

          {!readyToClaim ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.inkSoft, fontSize: 13, marginBottom: 12 }}>
              <Clock size={14} /> Aguarda {secondsLeft}s…
            </div>
          ) : (
            <button
              onClick={claim}
              disabled={claiming}
              style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <CheckCircle2 size={16} /> {claiming ? "A confirmar…" : "Confirmar que vi o anúncio"}
            </button>
          )}

          {error && <div style={{ color: C.red, fontSize: 12.5, marginBottom: 8 }}>{error}</div>}

          {status && (
            <div style={{ fontSize: 12, color: C.inkSoft, textAlign: "center" }}>
              {status.ad_credits > 0
                ? `Tens ${status.ad_credits} consulta(s) extra disponível(eis)!`
                : `Faltam ${status.views_needed} anúncio(s) para desbloqueares a próxima consulta.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
