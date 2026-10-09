import React, { useEffect, useState } from "react";
import {
  Home, Users, Coins, FileText, Bell, User, Wallet, Eye, EyeOff,
  Link2, Copy, Share2, Plus, ChevronRight, RefreshCw, BarChart3, Check, X, ShoppingBag, TrendingUp, Clock,
} from "lucide-react";
import { api } from "../api.js";
import { C, fmt } from "../tokens.js";
import Auth from "./Auth.jsx";

export default function AffiliatePanel() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("access_token"));
  if (!authed) return <Auth onAuthenticated={() => setAuthed(true)} brand="D3NA — Afiliados" />;
  return <AffiliateDashboard />;
}

function AffiliateDashboard() {
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState(null);
  const [notAffiliate, setNotAffiliate] = useState(false);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [tentativaAtual, setTentativaAtual] = useState(0);
  const [ultimoErro, setUltimoErro] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [rules, setRules] = useState(null);
  const [redotpayId, setRedotpayId] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("resumo");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [periodo, setPeriodo] = useState(7);
  const [copiado, setCopiado] = useState(false);
  const [resaleLinks, setResaleLinks] = useState([]);
  const [novoPreco, setNovoPreco] = useState("");
  const [compraMsg, setCompraMsg] = useState("");
  const [ultimoLinkComprado, setUltimoLinkComprado] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState("");
  const [naoLidas, setNaoLidas] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [mostrarNotifs, setMostrarNotifs] = useState(false);

  useEffect(() => { load(); api.affiliateNotificationsUnreadCount().then((r) => setNaoLidas(r.count)).catch(() => {}); }, []);

  async function abrirNotificacoes() {
    const lista = await api.affiliateNotifications().catch(() => []);
    setNotifs(lista);
    setMostrarNotifs(true);
    await api.affiliateNotificationsMarkSeen().catch(() => {});
    setNaoLidas(0);
  }

  async function load() {
    setLoading(true);
    setErroCarregar(false);
    const pausas = [0, 4000, 8000, 12000, 16000, 20000];
    for (let i = 0; i < pausas.length; i++) {
      setTentativaAtual(i + 1);
      if (pausas[i] > 0) await new Promise((r) => setTimeout(r, pausas[i]));
      try {
        const me = await api.affiliateMe();
        setAffiliate(me);
        setRedotpayId(me.redotpay_id || "");
        const [r, c, ru, rl] = await Promise.all([api.affiliateReferrals(), api.affiliateCommissions(), api.affiliateRules(), api.affiliateResaleLinks()]);
        setReferrals(r); setCommissions(c); setRules(ru); setResaleLinks(rl);
        setLoading(false);
        return;
      } catch (e) {
        const msg = (e && (e.message || e.toString())) || "erro desconhecido sem mensagem";
        if (msg.includes("Ainda não")) { setNotAffiliate(true); setLoading(false); return; }
        if (msg.includes("Token")) { localStorage.removeItem("access_token"); window.location.reload(); return; }
        setUltimoErro(msg);
      }
    }
    setErroCarregar(true);
    setLoading(false);
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

  const PRECO_COMPRA_LINK = 2400;

  async function comprarLink(e) {
    e.preventDefault();
    setCompraMsg("");
    const preco = Number(novoPreco);
    if (!preco) return;
    try {
      const link = await api.affiliateBuyResaleLink(preco);
      setUltimoLinkComprado(link);
      setNovoPreco("");
      const rl = await api.affiliateResaleLinks();
      setResaleLinks(rl);
    } catch (e2) {
      setCompraMsg(e2.message);
    }
  }

  function copiarCodigo(codigo) {
    navigator.clipboard?.writeText(codigo);
    setCodigoCopiado(codigo);
    setTimeout(() => setCodigoCopiado(""), 1800);
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

  if (loading) {
    return (
      <Centered>
        <div style={{ color: C.inkSoft, fontSize: 14 }}>
          {tentativaAtual > 1 ? `A ligar ao servidor… (tentativa ${tentativaAtual})` : "A carregar…"}
        </div>
      </Centered>
    );
  }

  if (notAffiliate) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
            Programa de afiliados D3NA
          </div>
          <div style={{ color: C.inkSoft, marginBottom: 20, fontSize: 14 }}>Ainda não és afiliado. Cria o teu link e começa a ganhar comissões.</div>
          <button onClick={tornarAfiliado} style={btnPrimary}>Tornar-me afiliado</button>
          {msg && <div style={{ color: C.red, marginTop: 12, fontSize: 13 }}>{msg}</div>}
        </div>
      </Centered>
    );
  }

  if (erroCarregar || !affiliate) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 300 }}>
          <div style={{ color: C.inkSoft, marginBottom: 10, fontSize: 14 }}>
            Não foi possível carregar os teus dados. O servidor pode estar a acordar — tenta de novo em alguns segundos.
          </div>
          <div style={{ color: C.red, marginBottom: 14, fontSize: 12, fontFamily: "monospace" }}>
            Erro real: {ultimoErro || "(sem detalhe)"}
          </div>
          <button onClick={load} style={btnPrimary}>Tentar novamente</button>
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", paddingBottom: 84 }}>
      {mostrarNotifs && (
        <div onClick={() => setMostrarNotifs(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", maxHeight: "70vh", overflowY: "auto", padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>Notificações</div>
              <button onClick={() => setMostrarNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={C.inkSoft} /></button>
            </div>
            {notifs.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem notificações ainda.</div>}
            {notifs.map((n) => (
              <div key={n.notification_id} style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{n.title}</div>
                <div style={{ color: C.inkSoft, fontSize: 13, marginTop: 2 }}>{n.message}</div>
                <div style={{ color: C.inkSoft, fontSize: 11, marginTop: 4 }}>{new Date(n.created_at).toLocaleString("pt-PT")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.navySoft, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 800, color: C.navy, fontSize: 17 }}>D3</span>
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 17, color: C.ink }}>D3NA</div>
            <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>Afiliados</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={abrirNotificacoes} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", position: "relative" }}>
            <IconBadge><Bell size={18} color={C.inkSoft} /></IconBadge>
            {naoLidas > 0 && (
              <span style={{ position: "absolute", top: -2, right: -2, background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {naoLidas}
              </span>
            )}
          </button>
          <button onClick={() => setTab("perfil")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <IconBadge><User size={18} color={C.inkSoft} /></IconBadge>
          </button>
        </div>
      </div>

      <div style={{ padding: "14px 16px 4px" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.ink }}>Olá,</div>
        <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 2 }}>Acompanhe o desempenho das suas indicações.</div>
      </div>

      {/* Navegacao */}
      <div style={{ display: "flex", gap: 8, padding: "14px 16px 6px", overflowX: "auto" }}>
        <NavPill icon={<Home size={14} />} label="Visão geral" active={tab === "resumo"} onClick={() => setTab("resumo")} />
        <NavPill icon={<Users size={14} />} label="Indicados" active={tab === "indicados"} onClick={() => setTab("indicados")} />
        <NavPill icon={<Coins size={14} />} label="Comissões" active={tab === "comissoes"} onClick={() => setTab("comissoes")} />
        <NavPill icon={<FileText size={14} />} label="Regras" active={tab === "regras"} onClick={() => setTab("regras")} />
        <NavPill icon={<ShoppingBag size={14} />} label="Mercado" active={tab === "mercado"} onClick={() => setTab("mercado")} />
      </div>

      <div style={{ padding: "10px 16px" }}>
        {tab === "resumo" && (
          <>
            <Card glow>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wallet size={16} color={C.inkSoft} />
                <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>Saldo disponível</div>
                <button onClick={() => setBalanceHidden((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: "auto" }}>
                  {balanceHidden ? <EyeOff size={15} color={C.inkSoft} /> : <Eye size={15} color={C.inkSoft} />}
                </button>
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 8 }}>
                {balanceHidden ? "•••• Kz" : fmt(affiliate.balance_aoa)}
              </div>
              <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
                {balanceHidden ? "≈ •••• USD" : `≈ ${affiliate.balance_usd} USD`}
              </div>
            </Card>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <QuickStat icon={<Users size={15} color={C.navy} />} label="Indicados" value={String(totalIndicados)} onClick={() => setTab("indicados")} />
              <QuickStat icon={<RefreshCw size={15} color={C.green} />} label="Conversões" value={String(totalConversoes)} onClick={() => setTab("indicados")} />
              <QuickStat icon={<Coins size={15} color={C.navy} />} label="Comissões" value={fmt(totalComissoesGanhas)} onClick={() => setTab("comissoes")} />
            </div>

            <Section icon={<Link2 size={15} color={C.inkSoft} />} title="Seu link de indicação">
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={referralLink} onClick={(e) => e.target.select()} style={inputStyle} />
                <button onClick={copiarLink} style={btnPrimarySmall}>
                  {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 12, color: C.inkSoft }}>Código: <span style={{ color: C.ink, fontWeight: 700 }}>{affiliate.referral_code}</span></div>
                <button onClick={partilharLink} style={btnGhostSmall}><Share2 size={13} /> Partilhar</button>
              </div>
            </Section>

            <Section icon={<Wallet size={15} color={C.inkSoft} />} title="Método de recebimento">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>RedotPay</div>
                <div style={{
                  display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  color: affiliate.redotpay_id ? C.green : "#935a00",
                  background: affiliate.redotpay_id ? C.greenBg : C.amberBg,
                }}>
                  {affiliate.redotpay_id ? "Configurado" : "Ainda não configurado"}
                </div>
              </div>
              <form onSubmit={guardarRedotpay} style={{ display: "flex", gap: 8 }}>
                <input value={redotpayId} onChange={(e) => setRedotpayId(e.target.value)} placeholder="O teu ID/username RedotPay" style={inputStyle} />
                <button type="submit" style={btnPrimarySmall}><Plus size={14} /> {affiliate.redotpay_id ? "Atualizar" : "Adicionar"}</button>
              </form>
              {!affiliate.redotpay_id && (
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 8 }}>
                  Para solicitar um levantamento, é necessário configurar uma conta RedotPay.
                </div>
              )}
            </Section>

            <Section icon={<Wallet size={15} color={C.inkSoft} />} title="Levantamento">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: C.inkSoft }}>Mínimo: {rules?.saque_minimo_usd || 5} USD</div>
                <button onClick={sacar} style={btnPrimary}>Solicitar levantamento</button>
              </div>
              {msg && <div style={{ color: C.navy, marginTop: 10, fontSize: 13 }}>{msg}</div>}
            </Section>

            <Section icon={<BarChart3 size={15} color={C.inkSoft} />} title="Desempenho">
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[7, 30, 90].map((p) => (
                  <button key={p} onClick={() => setPeriodo(p)} style={p === periodo ? filterActive : filterInactive}>{p} dias</button>
                ))}
              </div>
              {barras.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: C.inkSoft, fontSize: 13 }}>
                  Nenhum dado disponível no período selecionado.
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, padding: "0 4px" }}>
                  {barras.map(([dia, valor]) => (
                    <div key={dia} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", maxWidth: 22, borderRadius: 4, height: Math.max(6, (valor / maxBarra) * 70), background: C.navy }} />
                      <div style={{ fontSize: 10, color: C.inkSoft }}>{dia}</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {tab === "indicados" && (
          <Section icon={<Users size={15} color={C.inkSoft} />} title={`${totalIndicados} pessoa(s) registada(s) com o teu link`}>
            {referrals.length === 0 && <EmptyRow>Ainda não tens indicados.</EmptyRow>}
            {referrals.map((r) => (
              <Row key={r.user_id}>
                <span style={{ color: C.ink }}>{r.phone_number}</span>
                <span style={{ color: r.subscription_status === "ativo" ? C.green : C.inkSoft, fontWeight: 600, fontSize: 12 }}>
                  {r.subscription_status === "ativo" ? "Plano ativo" : "Sem plano"}
                </span>
              </Row>
            ))}
          </Section>
        )}

        {tab === "comissoes" && (
          <Section icon={<Coins size={15} color={C.inkSoft} />} title="Histórico de comissões">
            {commissions.length === 0 && <EmptyRow>Ainda não tens comissões.</EmptyRow>}
            {commissions.map((c) => (
              <Row key={c.commission_id}>
                <span style={{ color: C.inkSoft, fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString("pt-PT")} — {c.source_type}</span>
                <span style={{ color: C.green, fontWeight: 700 }}>+{fmt(c.amount_aoa)}</span>
              </Row>
            ))}
          </Section>
        )}

        {tab === "mercado" && (() => {
          const precoNum = Number(novoPreco) || 0;
          const lucro = precoNum > PRECO_COMPRA_LINK ? precoNum - PRECO_COMPRA_LINK : 0;
          return (
          <>
            <Section icon={<ShoppingBag size={15} color={C.inkSoft} />} title="Comprar link de uso único">
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>Define o preço de revenda antes de comprar.</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.4 }}>Preço de compra</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginTop: 4 }}>{fmt(PRECO_COMPRA_LINK)}</div>
                </div>
                <div style={{ flex: 1, background: lucro > 0 ? C.greenBg : C.bg, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.4, display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={11} /> O teu lucro
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: lucro > 0 ? C.green : C.inkSoft, marginTop: 4 }}>
                    {lucro > 0 ? fmt(lucro) : "—"}
                  </div>
                </div>
              </div>

              <form onSubmit={comprarLink}>
                <label style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6, display: "block" }}>Preço de revenda (AOA)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number" min={PRECO_COMPRA_LINK + 1} value={novoPreco}
                    onChange={(e) => setNovoPreco(e.target.value)}
                    placeholder={`Ex: ${PRECO_COMPRA_LINK + 1600}`}
                    style={inputStyle}
                  />
                  <button type="submit" disabled={!precoNum || precoNum <= PRECO_COMPRA_LINK} style={{ ...btnPrimary, opacity: (!precoNum || precoNum <= PRECO_COMPRA_LINK) ? 0.5 : 1 }}>
                    <Plus size={14} /> Comprar
                  </button>
                </div>
              </form>
              {compraMsg && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{compraMsg}</div>}

              {ultimoLinkComprado && (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: C.navySoft, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Pagar esta referência para activar</div>
                  <div style={{ color: C.ink, fontWeight: 700, fontSize: 14 }}>{ultimoLinkComprado.payment_reference || "ver no painel de pagamentos"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: C.inkSoft }}>Código do link:</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: C.navy, fontSize: 14, letterSpacing: 1 }}>{ultimoLinkComprado.access_code}</span>
                  </div>
                </div>
              )}
            </Section>

            <Section icon={<Link2 size={15} color={C.inkSoft} />} title={`Os teus links (${resaleLinks.length})`}>
              {resaleLinks.length === 0 && <EmptyRow>Ainda não compraste nenhum link.</EmptyRow>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {resaleLinks.map((l) => {
                  const disponivel = l.status === "disponivel";
                  const vendido = l.status === "usado";
                  const pendente = l.status === "pendente_pagamento";
                  const lucroLink = Number(l.resale_price) - Number(l.company_price);
                  return (
                    <div key={l.link_id} style={{ borderRadius: 10, padding: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: C.ink, fontSize: 14, letterSpacing: 0.5 }}>{l.access_code}</span>
                          {disponivel && (
                            <button onClick={() => copiarCodigo(l.access_code)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                              {codigoCopiado === l.access_code ? <Check size={12} color={C.green} /> : <Copy size={12} color={C.inkSoft} />}
                            </button>
                          )}
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          color: vendido ? C.green : disponivel ? C.navy : "#935a00",
                          background: vendido ? C.greenBg : disponivel ? C.navySoft : C.amberBg,
                        }}>
                          {pendente ? "Aguarda pagamento" : disponivel ? "Disponível" : vendido ? "Vendido" : l.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.inkSoft }}>
                        <span>Venda: <b style={{ color: C.ink }}>{fmt(l.resale_price)}</b></span>
                        {vendido && <span style={{ color: C.green }}>+{fmt(lucroLink)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </>
          );
        })()}

        {tab === "perfil" && (
          <Section icon={<User size={15} color={C.inkSoft} />} title="A tua conta">
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{affiliate.phone_number || "—"}</div>
            <div style={{ color: C.inkSoft, fontSize: 12, marginBottom: 16 }}>Código de afiliado: {affiliate.referral_code}</div>
            <button onClick={() => { localStorage.removeItem("access_token"); window.location.reload(); }} style={{ ...btnGhostSmall, color: C.red, borderColor: C.border }}>
              Sair da conta
            </button>
          </Section>
        )}

        {tab === "regras" && rules && (
          <Section icon={<FileText size={15} color={C.inkSoft} />} title="Tabela de comissões">
            {Object.entries(rules).filter(([k]) => k !== "aoa_usd_rate" && k !== "saque_minimo_usd").map(([key, r]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{fmt(r.valor_aoa)}</div>
                <div style={{ color: C.inkSoft, fontSize: 13 }}>{r.descricao}</div>
              </div>
            ))}
            <div style={{ color: C.inkSoft, fontSize: 12, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              Saque mínimo: {rules.saque_minimo_usd} USD · Taxa de conversão: {rules.aoa_usd_rate} AOA/USD
            </div>
          </Section>
        )}
      </div>

      {/* Navegacao inferior */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "10px 8px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <BottomItem icon={<Home size={18} />} label="Início" active={tab === "resumo"} onClick={() => setTab("resumo")} />
        <BottomItem icon={<Users size={18} />} label="Indicados" active={tab === "indicados"} onClick={() => setTab("indicados")} />
        <BottomItem icon={<Coins size={18} />} label="Comissões" active={tab === "comissoes"} onClick={() => setTab("comissoes")} />
        <BottomItem icon={<User size={18} />} label="Perfil" active={tab === "perfil"} onClick={() => setTab("perfil")} />
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon}
        <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function Card({ children, glow }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: glow ? `0 0 24px ${C.navy}22` : "none" }}>{children}</div>;
}
function IconBadge({ children }) {
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>;
}
function NavPill({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 8, cursor: "pointer",
      background: active ? C.navy : C.surface,
      border: `1px solid ${C.border}`,
      color: active ? "#fff" : C.ink,
      fontSize: 12.5, fontWeight: 600,
    }}>
      {icon} {label}
    </button>
  );
}
function QuickStat({ icon, label, value, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {icon}
        <ChevronRight size={13} color={C.inkSoft} />
      </div>
      <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>{value}</div>
    </div>
  );
}
function BottomItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.navy : C.inkSoft, cursor: "pointer" }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
function Row({ children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>{children}</div>;
}
function EmptyRow({ children }) {
  return <div style={{ color: C.inkSoft, fontSize: 13, padding: "8px 0" }}>{children}</div>;
}
function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>{children}</div>;
}

const inputStyle = { flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.ink, fontSize: 13, minWidth: 0 };
const btnPrimary = { display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, border: "none", background: C.navy, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnPrimarySmall = { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none", background: C.navy, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
const btnGhostSmall = { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.inkSoft, fontWeight: 600, fontSize: 12, cursor: "pointer" };
const filterActive = { padding: "6px 14px", borderRadius: 8, border: "none", background: C.navy, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const filterInactive = { padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer" };
