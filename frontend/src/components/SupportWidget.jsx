import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { C } from "../tokens.js";
import { api } from "../api.js";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState(() => localStorage.getItem("support_conv_id") || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [escalado, setEscalado] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && convId) {
      api.supportHistory(convId).then((msgs) => {
        setMessages(msgs);
        setEscalado(msgs.length > 0 && false); // estado real vem do proximo envio; ok comecar assim
      }).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ensureConversation() {
    if (convId) return convId;
    const conv = await api.supportStart();
    localStorage.setItem("support_conv_id", conv.conversation_id);
    setConvId(conv.conversation_id);
    return conv.conversation_id;
  }

  async function enviar() {
    if (!text.trim() || sending) return;
    setSending(true);
    const conteudo = text;
    setText("");
    setMessages((m) => [...m, { sender: "cliente", content: conteudo }]);
    try {
      const id = await ensureConversation();
      const r = await api.supportMessage(id, conteudo);
      if (r.resposta) setMessages((m) => [...m, { sender: "ia", content: r.resposta }]);
      if (r.status === "escalado") setEscalado(true);
    } catch (e) {
      setMessages((m) => [...m, { sender: "ia", content: "Erro ao enviar, tenta novamente." }]);
    } finally {
      setSending(false);
    }
  }

  const bubble = { position: "fixed", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 80 };
  const panel = { position: "fixed", top: 56, right: 14, width: 300, maxWidth: "calc(100vw - 28px)", height: 420, maxHeight: "calc(100vh - 100px)", background: C.surface, borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 80 };

  if (!open) {
    return (
      <div style={bubble} onClick={() => setOpen(true)}>
        <MessageCircle size={16} color="#fff" />
      </div>
    );
  }

  return (
    <div style={panel}>
      <div style={{ background: C.navy, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Apoio ao Cliente</div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={18} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: C.inkSoft, fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Olá! Em que posso ajudar hoje?
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.sender === "cliente" ? "flex-end" : "flex-start",
            background: m.sender === "cliente" ? C.navy : C.bg,
            color: m.sender === "cliente" ? "#fff" : C.ink,
            borderRadius: 12, padding: "8px 12px", fontSize: 13, maxWidth: "80%",
          }}>
            {m.content}
          </div>
        ))}
        {escalado && (
          <div style={{ fontSize: 11.5, color: C.inkSoft, textAlign: "center", padding: "6px 0" }}>
            A tua conversa foi encaminhada para a nossa equipa. Vamos responder em breve.
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 6, padding: 10, borderTop: `1px solid ${C.border}` }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escreve a tua mensagem…"
          style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 13, outline: "none" }}
        />
        <button onClick={enviar} disabled={sending} style={{ background: C.navy, border: "none", borderRadius: 10, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Send size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
}
