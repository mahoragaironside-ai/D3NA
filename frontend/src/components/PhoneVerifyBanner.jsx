import React, { useState } from "react";
import { api } from "../api.js";
import { C } from "../tokens.js";

export default function PhoneVerifyBanner({ onVerified, onDismiss }) {
  const [stage, setStage] = useState("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setError("");
    try {
      await api.sendOtp();
      setStage("sent");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    setError("");
    try {
      await api.verifyOtp(code);
      onVerified?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: C.navySoft, padding: "8px 16px", fontSize: 12.5, color: C.navy, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {stage !== "sent" ? (
        <>
          <span>Telefone ainda não verificado.</span>
          <button onClick={send} disabled={loading} style={btnStyle}>{loading ? "A enviar…" : "Enviar código por SMS"}</button>
        </>
      ) : (
        <>
          <span>Código enviado — insere abaixo:</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} style={{ width: 70, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 13 }} />
          <button onClick={verify} disabled={loading || code.length !== 6} style={btnStyle}>{loading ? "A verificar…" : "Confirmar"}</button>
          <button onClick={send} disabled={loading} style={{ ...btnStyle, background: "none", color: C.navy, textDecoration: "underline" }}>reenviar</button>
        </>
      )}
      {error && <span style={{ color: C.red }}>{error}</span>}
      <button onClick={onDismiss} style={{ marginLeft: "auto", background: "none", border: "none", color: C.navy, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>dispensar</button>
    </div>
  );
}

const btnStyle = { background: C.navy, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" };
