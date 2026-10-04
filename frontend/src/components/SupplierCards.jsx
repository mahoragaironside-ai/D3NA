import { MapPin, Phone, Globe, Star } from "lucide-react";
import { C } from "../tokens.js";

export default function SupplierCards({ result }) {
  if (!result) return null;

  if (!result.found || !result.suppliers?.length) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: "14px 16px", fontSize: 14, lineHeight: 1.5, color: C.ink,
      }}>
        {result.message || "Não encontrei fornecedores para esta pesquisa."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {result.message && (
        <div style={{ fontSize: 12.5, color: C.inkSoft, padding: "0 2px" }}>{result.message}</div>
      )}
      {result.suppliers.map((s, i) => (
        <div key={i} style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{s.name}</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, whiteSpace: "nowrap" }}>{s.price}</div>
          </div>
          {s.location && s.location !== "não especificado" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.inkSoft }}>
              <MapPin size={13} /> {s.location}
            </div>
          )}
          {s.reputation && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.inkSoft }}>
              <Star size={13} /> {s.reputation}
            </div>
          )}
          {s.contactUrl && (
            <a href={s.contactUrl} target="_blank" rel="noopener noreferrer" style={{
              marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: C.navySoft, color: C.navy, borderRadius: 10, padding: "8px 0",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              {s.contactType === "whatsapp" ? <Phone size={14} /> : <Globe size={14} />}
              {s.contactType === "whatsapp" ? "Contactar via WhatsApp" : "Ver site / contacto"}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
