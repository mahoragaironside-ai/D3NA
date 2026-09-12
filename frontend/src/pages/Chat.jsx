import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Loader2, Search, MoreVertical } from "lucide-react";
import { api } from "../api.js";
import { C } from "../tokens.js";
import ReportCard from "../components/ReportCard.jsx";
import ProgressPanel from "../components/ProgressPanel.jsx";
import AdBreak from "../components/AdBreak.jsx";

const CHIPS = [
  "Quero começar um negócio",
  "Devo comprar este produto?",
  "Quero importar",
  "Preciso de clientes",
  "Quero analisar uma decisão",
];

export default function Chat({ project, onProjectUpdate, subscription, onUpgrade }) {
  const isCourse = project.category === "curso_marketing";
  const [messages, setMessages] = useState(
    project.messages && project.messages.length > 0
      ? project.messages.map((m) => ({ role: m.role, content: m.content, type: "text" }))
      : isCourse
        ? []
        : [{ role: "assistant", content: "Qual decisão do teu negócio precisas tomar hoje? Explica a tua situação por texto — vou ajudar-te a organizar os dados, identificar riscos e definir os próximos passos.", type: "text" }]
  );
  const [memory, setMemory] = useState({ ...(project.memory?.confirmed_facts || {}), ...(project.memory?.user_estimates || {}) });
  const [memoryStatus, setMemoryStatus] = useState(buildStatus(project.memory));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [searchingSuppliers, setSearchingSuppliers] = useState(false);
  const [showAdBreak, setShowAdBreak] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const hasMountedRef = useRef(false);
  const prevMessageCountRef = useRef(messages.length);

  function checkNearBottom() {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }

  function handleScroll() {
    isNearBottomRef.current = checkNearBottom();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
    hasMountedRef.current = true;
    if (isCourse && messages.length === 0) {
      startCourse();
    }
  }, []);

  async function startCourse() {
    setLoading(true);
    try {
      const data = await api.sendMessage(project.project_id, "Quero começar o curso de marketing digital.");
      setMessages([{ role: "assistant", content: data.reply, type: "text" }]);
    } catch {
      setMessages([{ role: "assistant", content: "Não consegui iniciar o curso agora. Escreve qualquer coisa para tentarmos de novo.", type: "text" }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasMountedRef.current) return;
    const addedNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;
    const lastIsUser = messages[messages.length - 1]?.role === "user";
    if (addedNewMessage && (isNearBottomRef.current || lastIsUser)) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function send(text) {
    const t = text.trim();
    if (!t || loading) return;
    setMessages((m) => [...m, { role: "user", content: t, type: "text" }]);
    setInput("");
    setLoading(true);
    setUpgradeNotice(false);
    try {
      const data = await api.sendMessage(project.project_id, t);
      setMemoryStatus(data.memory);
      const flat = {};
      for (const [k, v] of Object.entries(data.memory || {})) flat[k] = v.value;
      setMemory(flat);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, type: "text" },
        ...(data.report ? [{ role: "assistant", type: "report", report: data.report }] : []),
        ...(data.supplierResults ? [{ role: "assistant", content: data.supplierResults, type: "text" }] : []),
      ]);
      onProjectUpdate?.(data.category);
    } catch (err) {
      if (err.message?.includes("Limite")) {
        setUpgradeNotice(true);
        setShowAdBreak(true);
        setMessages((m) => [...m, { role: "assistant", content: "Atingiste o limite de análises do plano gratuito este mês. Podes ver anúncios para desbloquear mais uma, ou ativar um plano.", type: "text" }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "Houve um problema a processar a tua mensagem. Tenta novamente.", type: "text" }]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleRecording() {
    setAudioError("");
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setAudioError("Este navegador não suporta gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleTranscription(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setAudioError("Não foi possível aceder ao microfone. Verifica as permissões.");
    }
  }

  async function handleTranscription(blob) {
    setIsTranscribing(true);
    try {
      const result = await api.transcribeAudio(project.project_id, blob);
      if (!result.transcript) {
        setMessages((m) => [...m, { role: "assistant", content: "Não consegui perceber nada no áudio. Podes tentar de novo ou escrever?", type: "text" }]);
      } else if (result.low_confidence) {
        setInput(result.transcript);
        setMessages((m) => [...m, { role: "assistant", content: `Não tenho certeza se interpretei corretamente esta parte: "${result.transcript}". Confirma ou corrige o texto antes de enviar.`, type: "text" }]);
      } else {
        await send(result.transcript);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Não consegui transcrever o áudio agora. Podes escrever a tua situação por texto?", type: "text" }]);
    } finally {
      setIsTranscribing(false);
    }
  }

  async function searchSuppliers() {
    if (searchingSuppliers) return;
    const productHint = memory.product_name || memory.objective;
    if (!productHint) {
      setMessages((m) => [...m, { role: "assistant", content: "Diz-me primeiro que produto queres que eu procure fornecedores (ex: \"perfumes importados\").", type: "text" }]);
      return;
    }
    setSearchingSuppliers(true);
    setMessages((m) => [...m, { role: "user", content: `🔍 Pesquisar fornecedores de: ${productHint}`, type: "text" }]);
    try {
      const result = await api.searchSuppliers(project.project_id, productHint);
      setMessages((m) => [...m, { role: "assistant", content: result.content, type: "text" }]);
    } catch (e) {
      const msg = e.message?.includes("bairro") ? e.message : "Não consegui pesquisar agora: " + e.message;
      setMessages((m) => [...m, { role: "assistant", content: msg, type: "text" }]);
    } finally {
      setSearchingSuppliers(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {subscription?.subscription_status !== "ativo" && (
        <div style={{ background: C.navySoft, color: C.navy, fontSize: 12.5, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Plano gratuito — 1 análise/mês.</span>
          <button onClick={onUpgrade} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
            Ativar — 600 Kz / 7 dias
          </button>
        </div>
      )}

      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowTools((s) => !s)}
          title="Ferramentas e progresso"
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <MoreVertical size={16} color={C.inkSoft} />
        </button>
      </div>

      {showTools && (
        <div style={{ padding: "8px 16px 0" }}>
          <ProgressPanel memory={memoryStatus} />
          <button
            onClick={searchSuppliers}
            disabled={searchingSuppliers}
            style={{
              marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 0",
              fontSize: 13, fontWeight: 600, color: C.navy, cursor: searchingSuppliers ? "default" : "pointer",
            }}>
            {searchingSuppliers ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
            {searchingSuppliers ? "A pesquisar na internet…" : "Pesquisar fornecedores reais"}
          </button>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            {CHIPS.map((c) => (
              <button key={c} onClick={() => send(c)} style={{ background: C.navySoft, color: C.navy, border: "none", borderRadius: 99, padding: "7px 12px", fontSize: 12.5, cursor: "pointer", fontWeight: 500 }}>
                {c}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => {
          if (m.type === "report") return <div key={i}><ReportCard report={m.report} /></div>;
          const isUser = m.role === "user";
          return (
            <div key={i} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{
                background: isUser ? C.navy : C.surface, color: isUser ? "#fff" : C.ink,
                border: isUser ? "none" : `1px solid ${C.border}`, borderRadius: 14,
                borderBottomRightRadius: isUser ? 4 : 14, borderBottomLeftRadius: isUser ? 14 : 4,
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: C.inkSoft, fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> a analisar…
          </div>
        )}
        {isTranscribing && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: C.inkSoft, fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> a transcrever áudio…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 12, background: C.surface, borderTop: `1px solid ${C.border}` }}>
        {isRecording && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.red, fontSize: 12.5, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: C.red, animation: "pulse 1s ease-in-out infinite" }} /> A gravar… toca de novo no microfone para parar.
          </div>
        )}
        {audioError && <div style={{ color: C.red, fontSize: 12.5, marginBottom: 6 }}>{audioError}</div>}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <button
            onClick={toggleRecording}
            disabled={isTranscribing}
            title={isRecording ? "Parar gravação" : "Gravar áudio"}
            style={{
              width: 40, height: 40, borderRadius: 12, border: `1px solid ${isRecording ? C.red : C.border}`,
              background: isRecording ? C.redBg : C.bg, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: isTranscribing ? "default" : "pointer", flexShrink: 0,
            }}>
            {isRecording ? <Square size={16} color={C.red} /> : <Mic size={17} color={C.inkSoft} />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Exemplo: Tenho 100.000 Kz e quero começar um negócio..."
            rows={1}
            style={{ flex: 1, resize: "none", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", maxHeight: 90 }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: loading || !input.trim() ? C.border : C.navy, display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "default" : "pointer", flexShrink: 0 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
      {showAdBreak && (
        <AdBreak
          onClose={() => setShowAdBreak(false)}
          onCredited={() => {
            setShowAdBreak(false);
            setMessages((m) => [...m, { role: "assistant", content: "Consulta extra desbloqueada — podes continuar.", type: "text" }]);
          }}
        />
      )}
    </div>
  );
}

function buildStatus(memory) {
  const out = {};
  for (const [k, v] of Object.entries(memory?.confirmed_facts || {})) out[k] = { value: v, status: "confirmado" };
  for (const [k, v] of Object.entries(memory?.user_estimates || {})) out[k] = { value: v, status: "estimado" };
  return out;
}
