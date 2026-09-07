import React, { useState } from "react";
import { api } from "../api.js";
import { C } from "../tokens.js";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? api.login : api.register;
      const data = await fn(phone, password);
      localStorage.setItem("access_token", data.access_token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "-apple-system, sans-serif" }}>
      <form onSubmit={submit} style={{ background: C.surface, borderRadius: 16, padding: 28, width: 320, maxWidth: "100%" }}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: C.inkSoft, textTransform: "uppercase", fontWeight: 600 }}>Consultor Digital</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.ink, margin: "4px 0 20px" }}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </div>

        <label style={labelStyle}>Número de telefone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" style={inputStyle} required />

        <label style={labelStyle}>Palavra-passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={6} />

        {error && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 18, background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "A processar…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.inkSoft }}>
          {mode === "login" ? "Ainda não tens conta? " : "Já tens conta? "}
          <a onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: C.navy, cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Cria uma" : "Entra"}
          </a>
        </div>
      </form>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: C.inkSoft, marginTop: 12, marginBottom: 5 };
const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" };
