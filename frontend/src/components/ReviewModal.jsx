import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { C } from "../tokens.js";
import { api } from "../api.js";

// Popup de avaliacao — pedido apos compra/uso, nunca bloqueante (tem sempre "Agora nao").
export default function ReviewModal({ serviceType, referenceId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!rating) return;
    setSending(true);
    setError("");
    try {
      await api.createReview(serviceType, referenceId, rating, comment);
      setSent(true);
      setTimeout(onClose, 1400);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,24,31,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 60 }}>
      <div style={{ background: C.surface, borderRadius: 16, width: 320, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "Georgia, serif" }}>
            Como foi a tua experiência?
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {sent ? (
            <p style={{ margin: 0, fontSize: 14, color: C.ink, textAlign: "center" }}>Obrigado pela tua avaliação! ✅</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                  >
                    <Star size={28} fill={(hover || rating) >= n ? "#f5a623" : "none"} color={(hover || rating) >= n ? "#f5a623" : C.inkSoft} />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comentário (opcional)"
                rows={3}
                style={{ resize: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, fontSize: 13, fontFamily: "inherit", color: C.ink }}
              />

              {error && <p style={{ margin: 0, fontSize: 12, color: "crimson" }}>{error}</p>}

              <button
                onClick={submit}
                disabled={!rating || sending}
                style={{
                  background: rating ? C.navy : C.border, color: "#fff", border: "none", borderRadius: 10,
                  padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: rating ? "pointer" : "default",
                }}
              >
                {sending ? "A enviar..." : "Enviar avaliação"}
              </button>

              <button onClick={onClose} style={{ background: "none", border: "none", color: C.inkSoft, fontSize: 12.5, cursor: "pointer" }}>
                Agora não
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
