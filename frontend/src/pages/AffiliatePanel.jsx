import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { C, fmt } from "../tokens.js";
import Auth from "./Auth.jsx";

export default function AffiliatePanel() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("access_token"));
  if (!authed) return <Auth onAuthenticated={() => setAuthed(true)} />;
  return <AffiliateDashboard />;
}

function AffiliateDashboard() {
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState(null);
  const [notAffiliate, setNotAffiliate] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [rules, setRules] = useState(null);
  const [redotpayId, setRedotpayId] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("resumo");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const me = await api.affiliateMe();
      setAffiliate(me);
      setRedotpayId(me.redotpay_id || "");
      const [r, c, ru] = await Promise.all([api.affiliateReferrals(), api.affiliateCommissions(), api.affiliateRules()]);
      setReferrals(r); setCommissions(c); setRules(ru);
    } catch (e) {
      if (String(e.message).includes("Ainda não")) setNotAffiliate(true);
    } finally {
      setLoading(false);
    }
  }

  async function tornarAfiliado() {
    setLoading(true);
    try { await api.affiliateRegister(); setNotAffiliate(false); await load(); }
    catch (e) { setMsg(e.message); } finally { setLoading(false); }
  }

  async function guardarRedotpay(e) {
    e.preventDefault();
    setMsg("");
    try { await api.affiliateSetRedotpay(redotpayId.trim()); setMsg("Guardado."); await load(); }
    catch (e2) { setMsg(e2.message); }
  }

  async function sacar() {
    setMsg("");
    try { const r = await api.affiliateWithdraw(); setMsg(`Saque pedido: ${fmt(r.amount_aoa)}.`); await load(); }
    catch (e) { setMsg(e.message); }
  }

  if (loading) return <Centered>A carregar…</Centered>;

  if (notAffiliate) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Programa de afiliados D3NA</div>
          <div style={{ color: C.inkSoft, marginBottom: 20 }}>Ainda não és afiliado. Cria o teu link e começa a ganhar comissões.</div>
          <button onClick={tornarAfiliado} style={btnPrimary}>Tornar-me afiliado</button>
          {msg && <div style={{ color: C.red, marginTop: 12 }}>{msg}</div>}
        </div>
      </Centered>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", padding: 16, paddingBottom: 60 }}>
      <div style={{ fontSize: 12, letterSpacing: 1, color: C.inkSoft, textTransform: "uppercase", fontWeight: 600 }}>Painel do afiliado</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: C.ink, margin: "4px 0 18px" }}>D3NA — Afiliados</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["resumo", "indicados", "comissoes", "regras"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={t === tab ? tabActive : tabInactive}>
            {t === "resumo" ? "Resumo" : t === "indicados" ? "Indicados" : t === "comissoes" ? "Comissões" : "Regras"}
          </button>
        ))}
      </div>

      {tab === "resumo" && (
        <>
          <Card>
            <div style={{ color: C.inkSoft, fontSize: 13 }}>Saldo disponível</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{fmt(affiliate.balance_aoa)}</div>
            <div style={{ color: C.inkSoft, fontSize: 13 }}>≈ {affiliate.balance_usd} USD</div>
          </Card>

          <Card>
            <div style={{ color: C.inkSoft, fontSize: 13, marginBottom: 6 }}>O teu link de referência</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly value={referralLink} style={inputStyle} onClick={(e) => e.target.select()} />
              <button onClick={() => navigator.clipboard?.writeText(referralLink)} style={btnSecondary}>Copiar</button>
            </div>
            <div style={{ color: C.inkSoft, fontSize: 12, marginTop: 6 }}>Código: {affiliate.referral_code}</div>
          </Card>

          <Card>
            <div style={{ color: C.inkSoft, fontSize: 13, marginBottom: 6 }}>Conta RedotPay (obrigatória para sacar)</div>
            <form onSubmit={guardarRedotpay} style={{ display: "flex", gap: 8 }}>
              <input value={redotpayId} onChange={(e) => setRedotpayId(e.target.value)} placeholder="O teu ID/username RedotPay" style={inputStyle} />
              <button type="submit" style={btnSecondary}>Guardar</button>
            </form>
            {!affiliate.redotpay_id && (
              <div style={{ color: C.amber, fontSize: 12, marginTop: 6 }}>
                Precisas de uma conta RedotPay activa para poder sacar. Se ainda não tens, cria uma antes de continuar.
              </div>
            )}
          </Card>

          <Card>
            <button onClick={sacar} style={btnPrimary}>Sacar saldo (mínimo 5 USD)</button>
            {msg && <div style={{ color: C.ink, marginTop: 10, fontSize: 13 }}>{msg}</div>}
          </Card>
        </>
      )}

      {tab === "indicados" && (
        <Card>
          <div style={{ color: C.inkSoft, fontSize: 13, marginBottom: 10 }}>{referrals.length} pessoa(s) registada(s) com o teu link</div>
          {referrals.length === 0 && <div style={{ color: C.inkSoft }}>Ainda não tens indicados.</div>}
          {referrals.map(r => (
            <div key={r.user_id} style={rowStyle}>
              <span>{r.phone_number}</span>
              <span style={{ color: r.subscription_status === "ativo" ? C.green : C.inkSoft }}>
                {r.subscription_status === "ativo" ? "Plano ativo" : "Sem plano"}
              </span>
            </div>
          ))}
        </Card>
      )}

      {tab === "comissoes" && (
        <Card>
          <div style={{ color: C.inkSoft, fontSize: 13, marginBottom: 10 }}>Histórico de comissões</div>
          {commissions.length === 0 && <div style={{ color: C.inkSoft }}>Ainda não tens comissões.</div>}
          {commissions.map(c => (
            <div key={c.commission_id} style={rowStyle}>
              <span>{new Date(c.created_at).toLocaleDateString("pt-PT")} — {c.source_type}</span>
              <span style={{ color: C.green, fontWeight: 600 }}>+{fmt(c.amount_aoa)}</span>
            </div>
          ))}
        </Card>
      )}

      {tab === "regras" && rules && (
        <Card>
          <div style={{ color: C.inkSoft, fontSize: 13, marginBottom: 10 }}>Tabela de comissões</div>
          {Object.entries(rules).filter(([k]) => k !== "aoa_usd_rate" && k !== "saque_minimo_usd").map(([key, r]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: C.ink }}>{fmt(r.valor_aoa)}</div>
              <div style={{ color: C.inkSoft, fontSize: 13 }}>{r.descricao}</div>
            </div>
          ))}
          <div style={{ color: C.inkSoft, fontSize: 12, marginTop: 10 }}>
            Saque mínimo: {rules.saque_minimo_usd} USD · Taxa de conversão: {rules.aoa_usd_rate} AOA/USD
          </div>
        </Card>
      )}
    </div>
  );
}

function Card({ children }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>{children}</div>;
}
function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.inkSoft }}>{children}</div>;
}

const inputStyle = { flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.ink, fontSize: 14 };
const btnPrimary = { padding: "12px 20px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnSecondary = { padding: "10px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const tabActive = { padding: "8px 14px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const tabInactive = { padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.inkSoft, fontSize: 13, cursor: "pointer" };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14, color: C.ink };
