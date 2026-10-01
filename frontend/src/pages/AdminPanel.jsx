import React, { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, LayoutDashboard, Wallet, Users, ClipboardList, Star, HeartHandshake, Network, MessageCircle, Link2, Check, X, ChevronLeft, Home, Briefcase, Megaphone, Settings, Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { api } from "../api.js";
import { C } from "../tokens.js";

const MENU = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pagamentos", label: "Pagamentos", icon: Wallet },
  { id: "utilizadores", label: "Utilizadores", icon: Users },
  { id: "registo", label: "Registo do sistema", icon: ClipboardList },
  { id: "indicadores", label: "Indicadores e qualidade", icon: Star },
  { id: "apoio_cliente", label: "Apoio ao Cliente", icon: MessageCircle },
  { id: "afiliados", label: "Apoio ao afiliado", icon: HeartHandshake },
  { id: "organograma", label: "Organograma", icon: Network },
  { id: "pessoal", label: "Módulo Pessoal", icon: Star },
];

function useUnreadSupportCount(adminKey, unlocked) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!unlocked) return;
    function load() {
      api.adminSupportUnreadCount(adminKey).then((r) => setCount(r.count)).catch(() => {});
    }
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [adminKey, unlocked]);
  return count;
}

const GRUPOS = {
  negocios: ["pagamentos", "utilizadores", "indicadores", "apoio_cliente", "afiliados", "organograma"],
  definicoes: ["registo", "pessoal"],
};

function NavInferior({ tab, setTab }) {
  const [sheet, setSheet] = useState(null); // 'negocios' | 'definicoes' | null

  const itensNoGrupo = sheet ? GRUPOS[sheet].map((id) => MENU.find((m) => m.id === id)).filter(Boolean) : [];

  function clicarCategoria(cat) {
    if (cat === "inicio") { setTab("dashboard"); setSheet(null); return; }
    if (cat === "marketing") { alert("Marketing — auto-promoção automática do D3NA. Funcionalidade futura, ainda por construir."); return; }
    setSheet(cat);
  }

  const activo = { color: C.navy };
  const inactivo = { color: C.inkSoft };

  return (
    <>
      {sheet && (
        <div onClick={() => setSheet(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 65 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", bottom: 64, left: 0, right: 0, background: C.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 10, zIndex: 66 }}>
            {itensNoGrupo.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => { setTab(m.id); setSheet(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: "12px 10px", fontSize: 14, color: C.ink, cursor: "pointer", textAlign: "left" }}>
                  <Icon size={16} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: "flex", background: C.surface, borderTop: `1px solid ${C.border}`, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button onClick={() => clicarCategoria("inicio")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", padding: "10px 0", cursor: "pointer", ...(tab === "dashboard" ? activo : inactivo) }}>
          <Home size={18} /><span style={{ fontSize: 11 }}>Início</span>
        </button>
        <button onClick={() => clicarCategoria("negocios")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", padding: "10px 0", cursor: "pointer", ...(GRUPOS.negocios.includes(tab) ? activo : inactivo) }}>
          <Briefcase size={18} /><span style={{ fontSize: 11 }}>Negócios</span>
        </button>
        <button onClick={() => clicarCategoria("marketing")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", padding: "10px 0", cursor: "pointer", ...inactivo }}>
          <Megaphone size={18} /><span style={{ fontSize: 11 }}>Marketing</span>
        </button>
        <button onClick={() => clicarCategoria("definicoes")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", padding: "10px 0", cursor: "pointer", ...(GRUPOS.definicoes.includes(tab) ? activo : inactivo) }}>
          <Settings size={18} /><span style={{ fontSize: 11 }}>Definições</span>
        </button>
      </div>
    </>
  );
}

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const unreadSupport = useUnreadSupportCount(adminKey, unlocked);

  async function tryUnlock(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const k = adminKey.trim(); setAdminKey(k); await api.adminSummary(k);
      setUnlocked(true);
    } catch (e2) {
      setError(e2.message || "Chave inválida.");
    } finally {
      setLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <div data-admin-theme="neural" style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif" }}>
        <form onSubmit={tryUnlock} style={{ background: C.surface, borderRadius: 16, padding: 28, width: 320 }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: C.inkSoft, textTransform: "uppercase", fontWeight: 600 }}>Painel administrativo</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, margin: "4px 0 18px" }}>D3NA — Painel de controlo</div>
          <input
            type="password"
            value={adminKey} autoCapitalize="none" autoCorrect="off" spellCheck={false}
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
    <div data-admin-theme="neural" style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif" }}>
      <NavInferior tab={tab} setTab={setTab} />

      <div style={{ padding: "18px 18px 88px" }}>
        {tab === "dashboard" && <DashboardTab adminKey={adminKey} />}
        {tab === "pagamentos" && <PagamentosTab adminKey={adminKey} />}
        {tab === "utilizadores" && <UtilizadoresTab adminKey={adminKey} />}
        {tab === "registo" && <RegistoTab adminKey={adminKey} />}
        {tab === "indicadores" && <IndicadoresTab adminKey={adminKey} />}
        {tab === "apoio_cliente" && <ApoioClienteTab adminKey={adminKey} />}
        {tab === "afiliados" && <AfiliadosTab adminKey={adminKey} />}
        {tab === "organograma" && <Organograma />}
        {tab === "pessoal" && <PessoalTab adminKey={adminKey} />}
      </div>
    </div>
  );
}

function Organograma() {
  const nivel = { fontSize: 11, letterSpacing: 0.6, color: C.inkSoft, textTransform: "uppercase", fontWeight: 700, margin: "24px 0 10px" };
  const box = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" };
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 };
  const sub = { fontSize: 11, color: C.inkSoft, marginTop: 2 };

  return (
    <div>
      <SectionTitle>Organograma</SectionTitle>

      <div style={{ ...box, maxWidth: 260, margin: "0 auto" }}>
        <div style={{ fontWeight: 700, color: C.ink }}>Fundador</div>
        <div style={sub}>Decisão, produto, confirmação de pagamentos</div>
      </div>

      <div style={nivel}>Serviços</div>
      <div style={grid}>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Consultoria Digital</div><div style={sub}>IA + subscrição semanal</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Construtor de Sites</div><div style={sub}>Sites por encomenda</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Curso Online</div><div style={sub}>Em desenvolvimento</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Programa de Afiliados</div><div style={sub}>Planeado</div></div>
      </div>

      <div style={nivel}>Funções de suporte (transversais)</div>
      <div style={grid}>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Pagamentos</div><div style={sub}>Manual hoje · automação planeada</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Apoio ao Cliente</div><div style={sub}>Planeado — IA + escalonamento</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Contabilidade</div><div style={sub}>Planeada — por IA</div></div>
        <div style={box}><div style={{ fontWeight: 600, color: C.ink }}>Produto / Tecnologia</div><div style={sub}>Fundador + IA</div></div>
      </div>
    </div>
  );
}

function ApoioClienteTab({ adminKey }) {
  const [conversas, setConversas] = useState([]);
  const [activa, setActiva] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState("");

  function loadLista() {
    api.adminSupportPending(adminKey).then(setConversas).catch(() => {});
  }

  useEffect(loadLista, [adminKey]);

  function abrir(conv) {
    setActiva(conv);
    api.adminSupportHistory(conv.conversation_id, adminKey).then(setMsgs).catch(() => {});
  }

  async function enviar() {
    if (!texto.trim() || !activa) return;
    await api.adminSupportReply(activa.conversation_id, texto, adminKey);
    setMsgs((m) => [...m, { sender: "admin", content: texto }]);
    setTexto("");
  }

  async function resolver() {
    if (!activa) return;
    await api.adminSupportResolve(activa.conversation_id, adminKey);
    setActiva(null);
    loadLista();
  }

  if (activa) {
    return (
      <div>
        <button onClick={() => setActiva(null)} style={{ background: "none", border: "none", color: C.navy, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
          ← Voltar à lista
        </button>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto", marginBottom: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === "cliente" ? "flex-start" : "flex-end",
                background: m.sender === "cliente" ? C.bg : (m.sender === "admin" ? C.navy : C.navySoft),
                color: m.sender === "admin" ? "#fff" : C.ink,
                borderRadius: 10, padding: "8px 12px", fontSize: 13, maxWidth: "85%",
              }}>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2 }}>{m.sender}</div>
                {m.content}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Responder ao cliente…"
              style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
            />
            <button onClick={enviar} style={{ background: C.navy, border: "none", borderRadius: 10, width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
          <button onClick={resolver} style={{ marginTop: 10, background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: C.inkSoft, cursor: "pointer" }}>
            Marcar como resolvido
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>Apoio ao Cliente — escalados ({conversas.length})</SectionTitle>
      {conversas.length === 0 ? (
        <div style={{ color: C.inkSoft, fontSize: 14, textAlign: "center", padding: 24 }}>Sem conversas escaladas.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conversas.map((c) => (
            <div key={c.conversation_id} onClick={() => abrir(c)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{c.phone_number || "Cliente"}</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{c.ultima_mensagem}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BotaoFlutuante({ onAction }) {
  const [aberto, setAberto] = useState(false);
  const acoes = [
    { id: "log", label: "Registar hoje" },
    { id: "divida", label: "Adicionar dívida" },
    { id: "despesa", label: "Adicionar despesa" },
    { id: "missao", label: "Adicionar missão" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
      {aberto && (
        <div style={{ position: "absolute", bottom: 60, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, display: "flex", flexDirection: "column", gap: 4, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {acoes.map((a) => (
            <button key={a.id} onClick={() => { setAberto(false); onAction(a.id); }} style={{ background: "none", border: "none", textAlign: "left", padding: "10px 12px", fontSize: 13, color: C.ink, cursor: "pointer", borderRadius: 8 }}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setAberto((a) => !a)} style={{ width: 52, height: 52, borderRadius: "50%", background: C.navy, border: "none", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: `0 4px 16px ${C.navy}88` }}>
        {aberto ? "×" : "+"}
      </button>
    </div>
  );
}

function PessoalTab({ adminKey }) {
  const [summary, setSummary] = useState(null);
  const [debts, setDebts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [missions, setMissions] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ meals_planned: 4, meals_completed: 0, workout_done: false, weight_kg: "" });

  function loadAll() {
    api.personalSummary(adminKey).then(setSummary).catch(() => {});
    api.personalDebts(adminKey).then(setDebts).catch(() => {});
    api.personalGoals(adminKey).then(setGoals).catch(() => {});
    api.personalMissions(adminKey).then(setMissions).catch(() => {});
  }

  useEffect(loadAll, [adminKey]);

  async function guardarLog() {
    const hoje = new Date().toISOString().slice(0, 10);
    await api.personalSaveLog({ log_date: hoje, ...logForm, weight_kg: logForm.weight_kg || null }, adminKey);
    setShowLogForm(false);
    loadAll();
  }

  async function pagarDivida(id) {
    await api.personalPayDebt(id, adminKey);
    loadAll();
  }

  async function concluirMissao(id) {
    await api.personalCompleteMission(id, adminKey);
    loadAll();
  }

  if (!summary) return <div style={{ color: C.inkSoft }}>A carregar…</div>;

  const dividasPendentes = debts.filter((d) => d.status === "pendente");
  const dividasOrdenadas = [...dividasPendentes].sort((a, b) => (a.due_date || "9999") < (b.due_date || "9999") ? -1 : 1);

  return (
    <div>
      <SectionTitle>Nível actual: {summary.nivel.nivel} — {summary.nivel.nome}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
        <Card><Stat label="Refeições cumpridas" value={summary.progresso.pct_refeicoes + "%"} /></Card>
        <Card><Stat label="Treinos feitos" value={summary.progresso.pct_treinos + "%"} /></Card>
        <Card><Stat label="Metas concluídas" value={summary.progresso.metas_concluidas} /></Card>
        <Card><Stat label="Dívidas pendentes" value={`${summary.dividas_pendentes.total.toLocaleString("pt-PT")} Kz`} /></Card>
        <Card><Stat label="Despesas este mês" value={`${summary.despesas_mes.toLocaleString("pt-PT")} Kz`} /></Card>
      </div>
      {summary.estagio && summary.estagio.estagioComecou && (
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 20 }}>
          Estágio: área {summary.estagio.area} de 6 ({summary.estagio.diasPassados} dias desde o início)
        </div>
      )}

      <SectionTitle>Registo de hoje</SectionTitle>
      {!showLogForm ? (
        <button onClick={() => setShowLogForm(true)} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Registar hoje
        </button>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, color: C.inkSoft }}>Refeições planeadas
              <input type="number" value={logForm.meals_planned} onChange={(e) => setLogForm({ ...logForm, meals_planned: parseInt(e.target.value) || 0 })} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 12, color: C.inkSoft }}>Refeições cumpridas
              <input type="number" value={logForm.meals_completed} onChange={(e) => setLogForm({ ...logForm, meals_completed: parseInt(e.target.value) || 0 })} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 13, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={logForm.workout_done} onChange={(e) => setLogForm({ ...logForm, workout_done: e.target.checked })} /> Treino feito hoje
            </label>
            <label style={{ fontSize: 12, color: C.inkSoft }}>Peso (kg, opcional)
              <input type="number" step="0.1" value={logForm.weight_kg} onChange={(e) => setLogForm({ ...logForm, weight_kg: e.target.value })} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginTop: 4 }} />
            </label>
            <button onClick={guardarLog} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>Guardar</button>
          </div>
        </Card>
      )}

      <SectionTitle>Dívidas pendentes ({dividasOrdenadas.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dividasOrdenadas.map((d) => (
          <div key={d.debt_id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{d.description}</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>
                {Number(d.amount).toLocaleString("pt-PT")} Kz {d.due_date ? "· vence " + new Date(d.due_date).toLocaleDateString("pt-PT") : d.recurring ? "· recorrente" : "· sem data"}
              </div>
            </div>
            <button onClick={() => pagarDivida(d.debt_id)} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Pago</button>
          </div>
        ))}
        {dividasOrdenadas.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem dívidas pendentes.</div>}
      </div>

      <SectionTitle>Metas de poupança</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100));
          return (
            <Card key={g.goal_id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: C.ink }}>
                <span>{g.title}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ background: C.border, borderRadius: 6, height: 8, marginTop: 6 }}>
                <div style={{ width: pct + "%", background: g.status === "concluida" ? C.green : C.navy, height: 8, borderRadius: 6 }} />
              </div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 4 }}>
                {Number(g.current_amount).toLocaleString("pt-PT")} / {Number(g.target_amount).toLocaleString("pt-PT")} Kz
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem metas registadas.</div>}
      </div>

      <BotaoFlutuante onAction={(id) => {
        if (id === "log") setShowLogForm(true);
        if (id === "divida") alert("Usa o formulário de dívidas abaixo (atalho directo a chegar em breve).");
        if (id === "despesa") alert("Secção de despesas a chegar em breve nesta aba.");
        if (id === "missao") alert("Criação rápida de missão a chegar em breve nesta aba.");
      }} />

      <SectionTitle>Missões / Agenda ({missions.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {missions.map((m) => (
          <div key={m.mission_id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{m.title}</div>
              {m.due_date && <div style={{ fontSize: 12, color: C.inkSoft }}>Até {new Date(m.due_date).toLocaleDateString("pt-PT")}</div>}
            </div>
            <button onClick={() => concluirMissao(m.mission_id)} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Concluir</button>
          </div>
        ))}
        {missions.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem missões pendentes.</div>}
      </div>
    </div>
  );
}

function AfiliadosTab({ adminKey }) {
  const [afiliados, setAfiliados] = useState([]);
  const [saques, setSaques] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [vista, setVista] = useState("lista"); // "lista" | "saques" | "detalhe"

  function loadLista() {
    api.adminAffiliatesList(adminKey).then(setAfiliados).catch(() => {});
    api.adminAffiliateWithdrawalsPending(adminKey).then(setSaques).catch(() => {});
  }

  useEffect(loadLista, [adminKey]);

  function abrirDetalhe(aff) {
    api.adminAffiliateDetail(aff.affiliate_id, adminKey).then(setDetalhe).catch(() => {});
    setVista("detalhe");
  }

  async function confirmarSaque(id) {
    await api.adminAffiliateConfirmWithdrawal(id, adminKey);
    loadLista();
  }
  async function rejeitarSaque(id) {
    await api.adminAffiliateRejectWithdrawal(id, adminKey);
    loadLista();
  }

  if (vista === "detalhe" && detalhe) {
    const a = detalhe.affiliate;
    return (
      <div>
        <button onClick={() => { setVista("lista"); setDetalhe(null); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.navy, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
          <ChevronLeft size={15} /> Voltar à lista
        </button>
        <SectionTitle>{a.phone_number} — código {a.referral_code}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <Card><Stat label="Saldo atual" value={`${Number(a.balance_aoa).toLocaleString("pt-PT")} Kz`} /></Card>
          <Card><Stat label="Indicados" value={detalhe.referrals.length} /></Card>
          <Card><Stat label="Comissões (histórico)" value={detalhe.commissions.length} /></Card>
          <Card><Stat label="RedotPay" value={a.redotpay_id ? "configurado" : "não configurado"} /></Card>
        </div>

        <SectionTitle>Indicados ({detalhe.referrals.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {detalhe.referrals.map((r) => (
            <div key={r.user_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{r.phone_number}</span>
              <span style={{ color: r.subscription_status === "ativo" ? C.green : C.inkSoft }}>{r.subscription_status === "ativo" ? "Plano ativo" : "Sem plano"}</span>
            </div>
          ))}
          {detalhe.referrals.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem indicados ainda.</div>}
        </div>

        <SectionTitle>Comissões ({detalhe.commissions.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {detalhe.commissions.map((c) => (
            <div key={c.commission_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{new Date(c.created_at).toLocaleDateString("pt-PT")} — {c.source_type}</span>
              <span style={{ color: C.green, fontWeight: 600 }}>+{Number(c.amount_aoa).toLocaleString("pt-PT")} Kz</span>
            </div>
          ))}
          {detalhe.commissions.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem comissões ainda.</div>}
        </div>

        <SectionTitle>Saques ({detalhe.withdrawals.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {detalhe.withdrawals.map((w) => (
            <div key={w.withdrawal_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{new Date(w.created_at).toLocaleDateString("pt-PT")} — {Number(w.amount_aoa).toLocaleString("pt-PT")} Kz</span>
              <span style={{ color: w.status === "pago" ? C.green : w.status === "rejeitado" ? C.red : C.inkSoft }}>{w.status}</span>
            </div>
          ))}
          {detalhe.withdrawals.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem saques ainda.</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setVista("lista")} style={{ background: vista === "lista" ? C.navy : C.surface, color: vista === "lista" ? "#fff" : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Afiliados</button>
        <button onClick={() => setVista("saques")} style={{ background: vista === "saques" ? C.navy : C.surface, color: vista === "saques" ? "#fff" : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Saques pendentes ({saques.length})</button>
      </div>

      {vista === "lista" && (
        <>
          <SectionTitle>Afiliados ({afiliados.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {afiliados.map((a) => (
              <div key={a.affiliate_id} onClick={() => abrirDetalhe(a)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{a.phone_number} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {a.referral_code}</span></div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>{a.total_referidos} indicado(s) · saldo {Number(a.balance_aoa).toLocaleString("pt-PT")} Kz</div>
                </div>
                <Link2 size={16} color={C.inkSoft} />
              </div>
            ))}
            {afiliados.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Ainda não há afiliados registados.</div>}
          </div>
        </>
      )}

      {vista === "saques" && (
        <>
          <SectionTitle>Saques pendentes ({saques.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {saques.map((w) => (
              <div key={w.withdrawal_id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{w.phone_number} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {w.referral_code}</span></div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 10 }}>
                  {Number(w.amount_aoa).toLocaleString("pt-PT")} Kz · RedotPay: {w.redotpay_id} · pedido {new Date(w.created_at).toLocaleString("pt-PT")}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => confirmarSaque(w.withdrawal_id)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <Check size={14} /> Pago
                  </button>
                  <button onClick={() => rejeitarSaque(w.withdrawal_id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: C.red, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <X size={14} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
            {saques.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem saques pendentes.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function AfiliadosTab({ adminKey }) {
  const [afiliados, setAfiliados] = useState([]);
  const [saques, setSaques] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [vista, setVista] = useState("lista"); // "lista" | "saques" | "detalhe"

  function loadLista() {
    api.adminAffiliatesList(adminKey).then(setAfiliados).catch(() => {});
    api.adminAffiliateWithdrawalsPending(adminKey).then(setSaques).catch(() => {});
  }

  useEffect(loadLista, [adminKey]);

  function abrirDetalhe(aff) {
    api.adminAffiliateDetail(aff.affiliate_id, adminKey).then(setDetalhe).catch(() => {});
    setVista("detalhe");
  }

  async function confirmarSaque(id) {
    await api.adminAffiliateConfirmWithdrawal(id, adminKey);
    loadLista();
  }
  async function rejeitarSaque(id) {
    await api.adminAffiliateRejectWithdrawal(id, adminKey);
    loadLista();
  }

  if (vista === "detalhe" && detalhe) {
    const a = detalhe.affiliate;
    return (
      <div>
        <button onClick={() => { setVista("lista"); setDetalhe(null); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.navy, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
          <ChevronLeft size={15} /> Voltar à lista
        </button>
        <SectionTitle>{a.phone_number} — código {a.referral_code}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <Card><Stat label="Saldo atual" value={`${Number(a.balance_aoa).toLocaleString("pt-PT")} Kz`} /></Card>
          <Card><Stat label="Indicados" value={detalhe.referrals.length} /></Card>
          <Card><Stat label="Comissões (histórico)" value={detalhe.commissions.length} /></Card>
          <Card><Stat label="RedotPay" value={a.redotpay_id ? "configurado" : "não configurado"} /></Card>
        </div>

        <SectionTitle>Indicados ({detalhe.referrals.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {detalhe.referrals.map((r) => (
            <div key={r.user_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{r.phone_number}</span>
              <span style={{ color: r.subscription_status === "ativo" ? C.green : C.inkSoft }}>{r.subscription_status === "ativo" ? "Plano ativo" : "Sem plano"}</span>
            </div>
          ))}
          {detalhe.referrals.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem indicados ainda.</div>}
        </div>

        <SectionTitle>Comissões ({detalhe.commissions.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {detalhe.commissions.map((c) => (
            <div key={c.commission_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{new Date(c.created_at).toLocaleDateString("pt-PT")} — {c.source_type}</span>
              <span style={{ color: C.green, fontWeight: 600 }}>+{Number(c.amount_aoa).toLocaleString("pt-PT")} Kz</span>
            </div>
          ))}
          {detalhe.commissions.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem comissões ainda.</div>}
        </div>

        <SectionTitle>Saques ({detalhe.withdrawals.length})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {detalhe.withdrawals.map((w) => (
            <div key={w.withdrawal_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13 }}>
              <span>{new Date(w.created_at).toLocaleDateString("pt-PT")} — {Number(w.amount_aoa).toLocaleString("pt-PT")} Kz</span>
              <span style={{ color: w.status === "pago" ? C.green : w.status === "rejeitado" ? C.red : C.inkSoft }}>{w.status}</span>
            </div>
          ))}
          {detalhe.withdrawals.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem saques ainda.</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setVista("lista")} style={{ background: vista === "lista" ? C.navy : C.surface, color: vista === "lista" ? "#fff" : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Afiliados</button>
        <button onClick={() => setVista("saques")} style={{ background: vista === "saques" ? C.navy : C.surface, color: vista === "saques" ? "#fff" : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Saques pendentes ({saques.length})</button>
      </div>

      {vista === "lista" && (
        <>
          <SectionTitle>Afiliados ({afiliados.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {afiliados.map((a) => (
              <div key={a.affiliate_id} onClick={() => abrirDetalhe(a)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{a.phone_number} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {a.referral_code}</span></div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>{a.total_referidos} indicado(s) · saldo {Number(a.balance_aoa).toLocaleString("pt-PT")} Kz</div>
                </div>
                <Link2 size={16} color={C.inkSoft} />
              </div>
            ))}
            {afiliados.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Ainda não há afiliados registados.</div>}
          </div>
        </>
      )}

      {vista === "saques" && (
        <>
          <SectionTitle>Saques pendentes ({saques.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {saques.map((w) => (
              <div key={w.withdrawal_id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{w.phone_number} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {w.referral_code}</span></div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 10 }}>
                  {Number(w.amount_aoa).toLocaleString("pt-PT")} Kz · RedotPay: {w.redotpay_id} · pedido {new Date(w.created_at).toLocaleString("pt-PT")}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => confirmarSaque(w.withdrawal_id)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <Check size={14} /> Pago
                  </button>
                  <button onClick={() => rejeitarSaque(w.withdrawal_id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: C.red, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <X size={14} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
            {saques.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem saques pendentes.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function EmBreve({ texto }) {
  return <div style={{ color: C.inkSoft, fontSize: 14, textAlign: "center", padding: 40 }}>{texto}</div>;
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: C.ink, margin: "24px 0 12px" }}>{children}</div>;
}

function Card({ children, glow }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: glow ? `0 0 24px ${C.navy}55` : "none" }}>{children}</div>;
}

// ---------- Dashboard ----------
function DashboardTab({ adminKey }) {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [bucket, setBucket] = useState("dia");

  useEffect(() => {
    api.adminSummary(adminKey).then(setSummary).catch(() => {});
    api.adminRevenue(adminKey, bucket).then((r) => setRevenue(r.map(x => ({ ...x, periodo: fmtDate(x.periodo) })))).catch(() => {});
    api.adminNewUsers(adminKey, bucket).then((r) => setNewUsers(r.map(x => ({ ...x, periodo: fmtDate(x.periodo) })))).catch(() => {});
  }, [adminKey, bucket]);

  if (!summary) return <div style={{ color: C.inkSoft }}>A carregar…</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["minuto", "hora", "dia", "mes", "ano"].map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            style={{
              background: bucket === b ? C.navy : C.surface, color: bucket === b ? "#fff" : C.ink,
              border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
            }}
          >
            {b}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        <Card glow><Stat label="Lucro total confirmado" value={`${Number(summary.receita_total).toLocaleString("pt-PT")} AOA`} /></Card>
        <Card glow><Stat label="Utilizadores" value={summary.total_utilizadores} /></Card>
        <Card><Stat label="Pendentes: subscrições" value={summary.pendentes.subscricoes} /></Card>
        <Card><Stat label="Pendentes: sites" value={summary.pendentes.sites} /></Card>
        <Card><Stat label="Pendentes: curso" value={summary.pendentes.curso} /></Card>
      </div>

      <SectionTitle>Receita ao longo do tempo</SectionTitle>
      <Card>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke={C.navy} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle>Novos utilizadores ao longo do tempo</SectionTitle>
      <Card>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={newUsers}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total" fill={C.accent || C.navy} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, fontFamily: "Georgia, serif" }}>{value}</div>
    </div>
  );
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

// ---------- Pagamentos ----------
function PagamentosTab({ adminKey }) {
  const [subs, setSubs] = useState([]);
  const [sites, setSites] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingPublish, setPendingPublish] = useState([]);

  function load() {
    api.adminPending(adminKey).then(setSubs).catch(() => {});
    api.adminPendingSiteBuilds(adminKey).then(setSites).catch(() => {});
    api.adminPendingCourses(adminKey).then(setCourses).catch(() => {});
    api.adminPendingPublishSiteBuilds(adminKey).then(setPendingPublish).catch(() => {});
  }

  useEffect(load, [adminKey]);

  return (
    <div>
      <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer", color: C.ink, marginBottom: 12 }}>
        <RefreshCw size={14} /> Atualizar
      </button>

      <SectionTitle>Consultoria — pendentes ({subs.length})</SectionTitle>
      <PendingList items={subs} idKey="subscription_id" onConfirm={(id) => api.adminConfirm(id, adminKey).then(load)} />

      <SectionTitle>Construtor de sites — pendentes ({sites.length})</SectionTitle>
      <PendingList items={sites} idKey="build_id" labelKey="company_name" onConfirm={(id) => api.adminConfirmSiteBuild(id, adminKey).then(load)} />

      <SectionTitle>Construtor de sites — à espera de publicação ({pendingPublish.length})</SectionTitle>
      <PendingPublishList items={pendingPublish} onPublish={(id, url) => api.adminPublishSiteBuild(id, url, adminKey).then(load)} />

      <SectionTitle>Curso — pendentes ({courses.length})</SectionTitle>
      <PendingList items={courses} idKey="enrollment_id" labelKey="phone_number" onConfirm={(id) => api.adminConfirmCourse(id, adminKey).then(load)} />
    </div>
  );
}

function PendingPublishList({ items, onPublish }) {
  if (items.length === 0) return <div style={{ color: C.inkSoft, fontSize: 13, padding: 12 }}>Ninguém à espera de publicação.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((s) => (
        <PublishRow key={s.build_id} item={s} onPublish={onPublish} />
      ))}
    </div>
  );
}

function PublishRow({ item, onPublish }) {
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);

  async function enviar() {
    if (!url.trim()) return;
    setSending(true);
    try {
      await onPublish(item.build_id, url.trim());
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{item.company_name}</div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
          padding: "2px 8px", borderRadius: 999,
          background: item.publish_status === "atualizacao_pedida" ? "#f5a623" : C.navySoft,
          color: item.publish_status === "atualizacao_pedida" ? "#fff" : C.navy,
        }}>
          {item.publish_status === "atualizacao_pedida" ? "Atualização" : "Novo"}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>
        {item.contact_info || ""} · plano {item.tier} · pago {new Date(item.created_at).toLocaleString("pt-PT")}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Link do Netlify (ex: https://o-teu-site.netlify.app)"
          style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
        />
        <button
          onClick={enviar}
          disabled={sending || !url.trim()}
          style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          {sending ? "…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}

function PendingList({ items, idKey, labelKey, onConfirm }) {
  if (items.length === 0) return <div style={{ color: C.inkSoft, fontSize: 13, padding: 12 }}>Sem pendentes.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((s) => (
        <div key={s[idKey]} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s[labelKey || "phone_number"]}</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft }}>
              Ref {s.payment_reference} · {Number(s.amount).toLocaleString("pt-PT")} {s.currency} · {new Date(s.created_at).toLocaleString("pt-PT")}
            </div>
          </div>
          <button onClick={() => onConfirm(s[idKey])} style={{ display: "flex", alignItems: "center", gap: 6, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <CheckCircle2 size={15} /> Confirmar
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------- Utilizadores ----------
function UtilizadoresTab({ adminKey }) {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.adminUsers(adminKey).then(setUsers).catch(() => {}); }, [adminKey]);

  return (
    <div>
      <SectionTitle>Utilizadores ({users.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((u) => (
          <Card key={u.user_id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{u.phone_number}</div>
                <div style={{ fontSize: 12, color: C.inkSoft }}>
                  {u.phone_verified ? "verificado" : "não verificado"} · plano {u.subscription_status} · registado {new Date(u.created_at).toLocaleDateString("pt-PT")}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>{u.ad_views_count} vídeos · {u.ad_credits} créditos</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Registo do sistema ----------
function RegistoTab({ adminKey }) {
  const [log, setLog] = useState([]);
  useEffect(() => { api.adminActivityLog(adminKey).then(setLog).catch(() => {}); }, [adminKey]);

  return (
    <div>
      <SectionTitle>Registo em sistema informativo ({log.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {log.map((l) => (
          <div key={l.log_id} style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 13, color: C.ink }}>
            <b>{l.event_type}</b> — {new Date(l.created_at).toLocaleString("pt-PT")}
            {l.details && Object.keys(l.details).length > 0 && (
              <div style={{ fontSize: 11.5, color: C.inkSoft }}>{JSON.stringify(l.details)}</div>
            )}
          </div>
        ))}
        {log.length === 0 && <div style={{ color: C.inkSoft, fontSize: 13 }}>Sem eventos registados ainda.</div>}
      </div>
    </div>
  );
}

// ---------- Indicadores e qualidade ----------
function IndicadoresTab({ adminKey }) {
  const [summary, setSummary] = useState(null);
  useEffect(() => { api.adminReviewsSummary(adminKey).then(setSummary).catch(() => {}); }, [adminKey]);

  if (!summary) return <div style={{ color: C.inkSoft }}>A carregar…</div>;

  return (
    <div>
      <SectionTitle>Qualidade — avaliações ({summary.total})</SectionTitle>
      <Card>
        <Stat label="Média geral" value={summary.average ? `${summary.average} ★` : "sem dados"} />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {[5, 4, 3, 2, 1].map((n) => {
            const found = summary.distribution.find((d) => d.rating === n);
            const count = found ? found.count : 0;
            const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ width: 30 }}>{n} ★</span>
                <div style={{ flex: 1, background: C.border, borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${pct}%`, background: "#f5a623", height: 8, borderRadius: 6 }} />
                </div>
                <span style={{ width: 30, textAlign: "right", color: C.inkSoft }}>{count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
