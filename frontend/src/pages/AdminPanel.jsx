import React, { useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { api } from "../api.js";
import { C } from "../tokens.js";

// Acede-se em /admin. A chave nunca é guardada — só fica em memória enquanto a página
// está aberta, e é enviada em cada pedido no cabeçalho x-admin-key.
export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmedIds, setConfirmedIds] = useState([]);

  async function load(key) {
    setLoading(true);
    setError("");
    try {
      const rows = await api.adminPending(key);
      setPending(rows);
      setUnlocked(true);
    } catch (e) {
      setError(e.message || "Chave inválida.");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }

  async function confirm(id) {
    try {
      await api.adminConfirm(id, adminKey);
      setConfirmedIds((c) => [...c, id]);
      setPending((p) => p.filter((s) => s.subscription_id !== id));
    } catch (e) {
      alert("Erro ao confirmar: " + e.message);
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif" }}>
        <form
          onSubmit={(e) => { e.preventDefault(); load(adminKey); }}
          style={{ background: C.surface, borderRadius: 16, padding: 28, width: 320 }}
        >
          <div style={{ fontSize: 12, letterSpacing: 1, color: C.inkSoft, textTransform: "uppercase", fontWeight: 600 }}>Painel administrativo</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, margin: "4px 0 18px" }}>Confirmação de pagamentos</div>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Chave administrativa"
            style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }}
          />
          {error && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 16, background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, color: C.inkSoft, textTransform: "uppercase", fontWeight: 600 }}>Painel administrativo</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.ink }}>Pagamentos pendentes ({pending.length})</div>
        </div>
        <button onClick={() => load(adminKey)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer", color: C.ink }}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {pending.length === 0 ? (
        <div style={{ color: C.inkSoft, fontSize: 14, textAlign: "center", padding: 40 }}>
          Sem pagamentos pendentes de confirmação.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((s) => (
            <div key={s.subscription_id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.phone_number}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>
                  Referência {s.payment_reference} · {Number(s.amount).toLocaleString("pt-PT")} {s.currency} · {new Date(s.created_at).toLocaleString("pt-PT")}
                </div>
              </div>
              <button
                onClick={() => confirm(s.subscription_id)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <CheckCircle2 size={15} /> Confirmar pagamento
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>
        Confirma um pagamento só depois de verificares no teu extrato FaciPay (ou app) que a
        transferência com o valor e a referência indicados foi mesmo recebida.
        Isto ativa a subscrição do utilizador por 7 dias a partir de agora.
      </div>
    </div>
  );
}
