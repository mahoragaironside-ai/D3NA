import React, { useEffect, useState } from "react";
import {
  Home, Users, Coins, FileText, Bell, User, Wallet, Eye, EyeOff,
  Link2, Copy, Share2, Plus, ChevronRight, RefreshCw, BarChart3, Check,
} from "lucide-react";
import { api } from "../api.js";
import { fmt } from "../tokens.js";
import Auth from "./Auth.jsx";

// Paleta propria deste painel (Dark Tech D3NA). Nao toca em tokens.js global
// para nao afetar Consultor/AdminPanel/SiteBuilder.
const T = {
  bg0: "#030914", bg1: "#06101D", bg2: "#081525",
  surface: "#0A1628", surfaceSoft: "#0D1B30", surfaceStrong: "#101F35",
  blue: "#006CFF", blue2: "#007BFF", blue3: "#008CFF",
  electric: "#00A8FF", electric2: "#00C6FF", cyan: "#00E5FF",
  white: "#F4F8FF", textSoft: "#91A7C4",
  border: "rgba(0,108,255,0.18)", borderSoft: "rgba(0,108,255,0.10)",
  green: "#00E5A8", pink: "#FF3D77",
};

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
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [periodo, setPeriodo] = useState(7);
  const [copiado, setCopiado] = useState(false);

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

  function copiarLink() {
    navigator.clipboard?.writeText(referralLink);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function partilharLink() {
    if (navigator.share) {
      try { await navigator.share({ title: "D3NA — Afiliados", url: referralLink }); } catch {}
    } else {
      copiarLink();
    }
  }

  if (loading) return <Centered>A carregar…</Centered>;

  if (notAffiliate) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: "Inter, -apple-system, sans-serif", fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 10 }}>
            Programa de afiliados D3NA
          </div>
          <div style={{ color: T.textSoft, marginBottom: 20 }}>Ainda não és afiliado. Cria o teu link e começa a ganhar comissões.</div>
          <button onClick={tornarAfiliado} style={btnPrimary}>Tornar-me afiliado</button>
          {msg && <div style={{ color: T.pink, marginTop: 12 }}>{msg}</div>}
        </div>
      </Centered>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;
  const totalIndicados = referrals.length;
  const totalConversoes = referrals.filter((r) => r.subscription_status === "ativo").length;
  const totalComissoesGanhas = commissions.reduce((acc, c) => acc + Number(c.amount_aoa), 0);

  const agora = new Date();
  const limite = new Date(agora.getTime() - periodo * 24 * 60 * 60 * 1000);
  const comissoesNoPeriodo = commissions.filter((c) => new Date(c.created_at) >= limite);
  const buckets = {};
  comissoesNoPeriodo.forEach((c) => {
    const dia = new Date(c.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
    buckets[dia] = (buckets[dia] || 0) + Number(c.amount_aoa);
  });
  const barras = Object.entries(buckets);
  const maxBarra = barras.length ? Math.max(...barras.map(([, v]) => v)) : 0;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 20% 0%, ${T.bg2} 0%, ${T.bg0} 55%)`, fontFamily: "Inter, -apple-system, sans-serif", paddingBottom: 84 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: T.surfaceSoft, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px rgba(0,140,255,0.25)` }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, color: T.electric, fontSize: 20 }}>D3</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: T.white, letterSpacing: 0.3 }}>D3NA</div>
            <div style={{ fontSize: 12, color: T.electric2, fontWeight: 600 }}>Afiliados</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconBadge><Bell size={18} color={T.textSoft} /></IconBadge>
          <IconBadge><User size={18} color={T.textSoft} /></IconBadge>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: T.surfaceSoft, border: `1px solid ${T.border}` }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
          <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>Programa de Afiliados</span>
        </div>
      </div>

      {/* Saudacao */}
      <div style={{ padding: "18px 16px 4px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.white }}>Olá,</div>
        <div style={{ fontSize: 14, color: T.textSoft, marginTop: 2 }}>Acompanhe o desempenho das suas indicações.</div>
      </div>

      {/* Navegacao */}
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 6px", overflowX: "auto" }}>
        <NavPill icon={<Home size={15} />} label="Visão geral" active={tab === "resumo"} onClick={() => setTab("resumo")} />
        <NavPill icon={<Users size={15} />} label="Indicados" active={tab === "indicados"} onClick={() => setTab("indicados")} />
        <NavPill icon={<Coins size={15} />} label="Comissões" active={tab === "comissoes"} onClick={() => setTab("comissoes")} />
        <NavPill icon={<FileText size={15} />} label="Regras" active={tab === "regras"} onClick={() => setTab("regras")} />
      </div>

      <div style={{ padding: "10px 16px" }}>
        {tab === "resumo" && (
          <>
            {/* Saldo */}
            <div style={{
              position: "relative", overflow: "hidden", borderRadius: 20, padding: 20, marginBottom: 14,
              background: `linear-gradient(145deg, ${T.surfaceStrong}, ${T.surface})`,
              border: `1px solid ${T.border}`, boxShadow: `0 0 40px rgba(0,108,255,0.12)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,140,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wallet size={18} color={T.electric2} />
                </div>
                <div style={{ fontSize: 13, color: T.textSoft, fontWeight: 600 }}>Saldo disponível</div>
                <button onClick={() => setBalanceHidden((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {balanceHidden ? <EyeOff size={16} color={T.textSoft} /> : <Eye size={16} color={T.textSoft} />}
                </button>
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, color: T.white, marginTop: 10, letterSpacing: 0.3 }}>
                {balanceHidden ? "•••• Kz" : fmt(affiliate.balance_aoa)}
              </div>
              <div style={{ fontSize: 13, color: T.textSoft, marginTop: 2 }}>
                {balanceHidden ? "≈ •••• USD" : `≈ ${affiliate.balance_usd} USD`}
              </div>
              <svg viewBox="0 0 300 40" style={{ position: "absolute", right: 0, bottom: 0, width: "55%", opacity: 0.35 }}>
                <path d="M0,30 C40,10 70,35 110,18 C150,4 190,28 230,14 C260,4 280,20 300,8" fill="none" stroke={T.electric2} strokeWidth="2" />
              </svg>
            </div>

            {/* Indicadores rapidos */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <QuickStat icon={<Users size={16} color={T.blue3} />} label="Indicados" value={String(totalIndicados)} accent={T.blue3} />
              <QuickStat icon={<RefreshCw size={16} color={T.electric2} />} label="Conversões" value={String(totalConversoes)} accent={T.electric2} />
              <QuickStat icon={<Coins size={16} color={T.cyan} />} label="Comissões" value={fmt(totalComissoesGanhas)} accent={T.cyan} />
            </div>

            {/* Link de indicacao */}
            <Section icon={<Link2 size={16} color={T.electric2} />} title="Seu link de indicação">
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={referralLink} onClick={(e) => e.target.select()} style={inputStyle} />
                <button onClick={copiarLink} style={btnPrimarySmall}>
                  {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 12, color: T.textSoft }}>Código: <span style={{ color: T.white, fontWeight: 700 }}>{affiliate.referral_code}</span></div>
                <button onClick={partilharLink} style={btnGhostSmall}><Share2 size={14} /> Partilhar</button>
              </div>
            </Section>

            {/* RedotPay */}
            <Section icon={<Wallet size={16} color={T.pink} />} title="Método de recebimento">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: T.white, fontSize: 15 }}>RedotPay</div>
                  <div style={{
                    display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    color: affiliate.redotpay_id ? T.green : T.pink,
                    background: affiliate.redotpay_id ? "rgba(0,229,168,0.12)" : "rgba(255,61,119,0.10)",
                    border: `1px solid ${affiliate.redotpay_id ? "rgba(0,229,168,0.35)" : "rgba(255,61,119,0.35)"}`,
                  }}>
                    {affiliate.redotpay_id ? "Configurado" : "Ainda não configurado"}
                  </div>
                </div>
              </div>
              <form onSubmit={guardarRedotpay} style={{ display: "flex", gap: 8 }}>
                <input value={redotpayId} onChange={(e) => setRedotpayId(e.target.value)} placeholder="O teu ID/username RedotPay" style={inputStyle} />
                <button type="submit" style={btnPrimarySmall}><Plus size={15} /> {affiliate.redotpay_id ? "Atualizar" : "Adicionar"}</button>
              </form>
              {!affiliate.redotpay_id && (
                <div style={{ fontSize: 12, color: T.textSoft, marginTop: 8 }}>
                  Para solicitar um levantamento, é necessário configurar uma conta RedotPay.
                </div>
              )}
            </Section>

            {/* Levantamento */}
            <Section icon={<Wallet size={16} color={T.electric} />} title="Levantamento">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: T.textSoft }}>Mínimo: {rules?.saque_minimo_usd || 5} USD</div>
                <button onClick={sacar} style={btnPrimary}>Solicitar levantamento <ChevronRight size={15} /></button>
              </div>
              {msg && <div style={{ color: T.electric2, marginTop: 10, fontSize: 13 }}>{msg}</div>}
            </Section>

            {/* Desempenho */}
            <Section icon={<BarChart3 size={16} color={T.cyan} />} title="Desempenho">
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[7, 30, 90].map((p) => (
                  <button key={p} onClick={() => setPeriodo(p)} style={p === periodo ? filterActive : filterInactive}>{p} dias</button>
                ))}
              </div>
              {barras.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: T.textSoft, fontSize: 13 }}>
                  <BarChart3 size={26} color={T.textSoft} style={{ marginBottom: 8, opacity: 0.6 }} />
                  <div>Nenhum dado disponível no período selecionado.</div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, padding: "0 4px" }}>
                  {barras.map(([dia, valor]) => (
                    <div key={dia} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: "100%", maxWidth: 22, borderRadius: 6,
                        height: Math.max(6, (valor / maxBarra) * 70),
                        background: `linear-gradient(180deg, ${T.electric2}, ${T.blue})`,
                        boxShadow: `0 0 10px rgba(0,198,255,0.35)`,
                      }} />
                      <div style={{ fontSize: 10, color: T.textSoft }}>{dia}</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {tab === "indicados" && (
          <Section icon={<Users size={16} color={T.blue3} />} title={`${totalIndicados} pessoa(s) registada(s) com o teu link`}>
            {referrals.length === 0 && <EmptyRow>Ainda não tens indicados.</EmptyRow>}
            {referrals.map((r) => (
              <Row key={r.user_id}>
                <span style={{ color: T.white }}>{r.phone_number}</span>
                <span style={{ color: r.subscription_status === "ativo" ? T.green : T.textSoft, fontWeight: 600, fontSize: 12 }}>
                  {r.subscription_status === "ativo" ? "Plano ativo" : "Sem plano"}
                </span>
              </Row>
            ))}
          </Section>
        )}

        {tab === "comissoes" && (
          <Section icon={<Coins size={16} color={T.cyan} />} title="Histórico de comissões">
            {commissions.length === 0 && <EmptyRow>Ainda não tens comissões.</EmptyRow>}
            {commissions.map((c) => (
              <Row key={c.commission_id}>
                <span style={{ color: T.textSoft, fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString("pt-PT")} — {c.source_type}</span>
                <span style={{ color: T.green, fontWeight: 700 }}>+{fmt(c.amount_aoa)}</span>
              </Row>
            ))}
          </Section>
        )}

        {tab === "regras" && rules && (
          <Section icon={<FileText size={16} color={T.electric2} />} title="Tabela de comissões">
            {Object.entries(rules).filter(([k]) => k !== "aoa_usd_rate" && k !== "saque_minimo_usd").map(([key, r]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: T.white, fontSize: 16 }}>{fmt(r.valor_aoa)}</div>
                <div style={{ color: T.textSoft, fontSize: 13 }}>{r.descricao}</div>
              </div>
            ))}
            <div style={{ color: T.textSoft, fontSize: 12, marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              Saque mínimo: {rules.saque_minimo_usd} USD · Taxa de conversão: {rules.aoa_usd_rate} AOA/USD
            </div>
          </Section>
        )}
      </div>

      {/* Navegacao inferior */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around",
        padding: "10px 8px", background: "rgba(6,16,29,0.92)", backdropFilter: "blur(10px)",
        borderTop: `1px solid ${T.border}`,
      }}>
        <BottomItem icon={<Home size={18} />} label="Início" active={tab === "resumo"} onClick={() => setTab("resumo")} />
        <BottomItem icon={<Users size={18} />} label="Indicados" active={tab === "indicados"} onClick={() => setTab("indicados")} />
        <BottomItem icon={<Coins size={18} />} label="Comissões" active={tab === "comissoes"} onClick={() => setTab("comissoes")} />
        <BottomItem icon={<User size={18} />} label="Perfil" active={false} onClick={() => {}} />
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 14,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon}
        <div style={{ fontSize: 13, color: T.textSoft, fontWeight: 600 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function IconBadge({ children }) {
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: T.surfaceSoft, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>;
}
function NavPill({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", padding: "9px 14px", borderRadius: 12, cursor: "pointer",
      background: active ? "rgba(0,140,255,0.14)" : "transparent",
      border: `1px solid ${active ? "rgba(0,168,255,0.45)" : T.border}`,
      color: active ? T.white : T.textSoft,
      boxShadow: active ? `0 0 14px rgba(0,140,255,0.25)` : "none",
      fontSize: 13, fontWeight: 600,
    }}>
      <span style={{ color: active ? T.electric2 : T.textSoft, display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}
function QuickStat({ icon, label, value, accent }) {
  return (
    <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {icon}
        <ChevronRight size={13} color={T.textSoft} />
      </div>
      <div style={{ fontSize: 11, color: T.textSoft, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.white, marginTop: 2 }}>{value}</div>
    </div>
  );
}
function BottomItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? T.electric2 : T.textSoft, cursor: "pointer" }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
function Row({ children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>{children}</div>;
}
function EmptyRow({ children }) {
  return <div style={{ color: T.textSoft, fontSize: 13, padding: "8px 0" }}>{children}</div>;
}
function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg0, color: T.textSoft }}>{children}</div>;
}

const inputStyle = { flex: 1, padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceSoft, color: T.white, fontSize: 13, minWidth: 0 };
const btnPrimary = { display: "flex", alignItems: "center", gap: 6, padding: "12px 18px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${T.blue3}, ${T.electric})`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,140,255,0.35)" };
const btnPrimarySmall = { display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${T.blue3}, ${T.electric})`, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
const btnGhostSmall = { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textSoft, fontWeight: 600, fontSize: 12, cursor: "pointer" };
const filterActive = { padding: "7px 14px", borderRadius: 10, border: "none", background: T.blue3, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" };
const filterInactive = { padding: "7px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textSoft, fontSize: 12, fontWeight: 600, cursor: "pointer" };
