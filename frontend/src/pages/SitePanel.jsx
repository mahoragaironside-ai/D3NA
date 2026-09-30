import React, { useState } from "react";
import { api } from "../api.js";
import { C } from "../tokens.js";
import ContactLinksPicker from "../components/ContactLinksPicker.jsx";

const CORES = [
  { id: "azul", primary: "#16305C", secondary: "#FFFFFF", label: "Azul & Branco" },
  { id: "verde", primary: "#1E7A52", secondary: "#F5F6F8", label: "Verde & Cinza claro" },
  { id: "grafite", primary: "#15181F", secondary: "#E0AA4E", label: "Grafite & Dourado" },
  { id: "vinho", primary: "#7A1E2E", secondary: "#FFFFFF", label: "Vinho & Branco" },
  { id: "terracota", primary: "#B24C2B", secondary: "#FFF6EF", label: "Terracota & Creme" },
  { id: "roxo", primary: "#4B2E83", secondary: "#F5F0FA", label: "Roxo & Lilás claro" },
  { id: "petroleo", primary: "#0D3B3E", secondary: "#E7F4F3", label: "Petróleo & Turquesa claro" },
  { id: "mostarda", primary: "#8A6A14", secondary: "#FFFBF0", label: "Mostarda & Creme" },
  { id: "coral", primary: "#C94A38", secondary: "#FFF8F6", label: "Coral & Branco suave" },
  { id: "preto", primary: "#0A0A0A", secondary: "#FFFFFF", label: "Preto & Branco" },
];

export default function SitePanel({ buildId }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactLinks, setContactLinks] = useState([]);
  const [colorScheme, setColorScheme] = useState("");
  const [catalogItems, setCatalogItems] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [structureChoice, setStructureChoice] = useState(null);
  const [domainChoice, setDomainChoice] = useState("");
  const [publishStatus, setPublishStatus] = useState(null);
  const [siteUrl, setSiteUrl] = useState(null);
  const [requestingUpdate, setRequestingUpdate] = useState(false);

  const precisaCatalogo = [2, 3, 5].includes(structureChoice);
  const precisaGaleria = structureChoice === 4;

  async function entrar(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const d = await api.siteBuildPanelLogin(buildId, password);
      setCompanyName(d.company_name || "");
      setCompanyDescription(d.company_description || "");
      setContactLinks(d.contact_links || []);
      setColorScheme(d.color_scheme || "");
      setCatalogItems(d.catalog_items || []);
      setGalleryItems(d.gallery_items || []);
      setStructureChoice(d.structure_choice);
      setDomainChoice(d.domain_choice);
      setPublishStatus(d.publish_status);
      setSiteUrl(d.site_url);
      setUnlocked(true);
    } catch (e2) {
      setError(e2.message || "Password incorreta.");
    } finally {
      setLoading(false);
    }
  }

  async function guardar() {
    setSaving(true);
    setSaveMsg("");
    try {
      await api.siteBuildPanelSave(buildId, {
        password,
        company_name: companyName,
        company_description: companyDescription,
        contact_links: contactLinks,
        catalog_items: catalogItems,
        gallery_items: galleryItems,
        color_scheme: colorScheme,
      });
      setSaveMsg("Guardado com sucesso.");
    } catch (e2) {
      setSaveMsg(e2.message || "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function pedirAtualizacao() {
    setRequestingUpdate(true);
    setSaveMsg("");
    try {
      await api.siteBuildPanelRequestUpdate(buildId, password);
      setPublishStatus("atualizacao_pedida");
    } catch (e2) {
      setSaveMsg(e2.message || "Não foi possível pedir a atualização.");
    } finally {
      setRequestingUpdate(false);
    }
  }

  function addCatalogItem() {
    setCatalogItems((arr) => [...arr, { name: "", price: "", description: "", image_url: "" }]);
  }
  function updateCatalogItem(i, field, value) {
    setCatalogItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }
  function removeCatalogItem(i) {
    setCatalogItems((arr) => arr.filter((_, idx) => idx !== i));
  }

  function addGalleryItem() {
    setGalleryItems((arr) => [...arr, { image_url: "", caption: "" }]);
  }
  function updateGalleryItem(i, field, value) {
    setGalleryItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }
  function removeGalleryItem(i) {
    setGalleryItems((arr) => arr.filter((_, idx) => idx !== i));
  }

  const wrap = { minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", display: "flex", justifyContent: "center", padding: "16px 12px" };
  const card = { background: C.surface, borderRadius: 16, padding: 18, width: 460, maxWidth: "100%", boxSizing: "border-box" };
  const title = { fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 4 };
  const subtitle = { fontSize: 12.5, color: C.inkSoft, marginBottom: 12 };
  const fieldLabel = { fontSize: 12, color: C.inkSoft, fontWeight: 600, marginTop: 14, marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14 };
  const navBtn = { background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const ghostBtn = { ...navBtn, background: C.surface, color: C.navy, border: `1px solid ${C.navy}` };
  const colorBtn = (active) => ({
    display: "inline-block", textAlign: "left", background: active ? C.navySoft : C.bg,
    border: `1px solid ${active ? C.navy : C.border}`, borderRadius: 10, padding: "6px 10px",
    marginRight: 6, marginBottom: 6, cursor: "pointer", color: C.ink, fontSize: 12.5,
  });

  if (!unlocked) {
    return (
      <div style={wrap}>
        <form onSubmit={entrar} style={card}>
          <div style={title}>Painel de controlo</div>
          <div style={subtitle}>Escreve a password que criaste no wizard.</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password do painel"
            style={inputStyle}
          />
          {error && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ ...navBtn, width: "100%", marginTop: 14 }}>
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={title}>{companyName || "O teu site"}</div>
        <div style={subtitle}>Altera o que quiseres e depois clica em Guardar.</div>

        <label style={fieldLabel}>Nome da empresa</label>
        <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

        <label style={fieldLabel}>Descrição curta</label>
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "none" }}
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
        />

        <label style={fieldLabel}>Contactos</label>
        <ContactLinksPicker value={contactLinks} onChange={setContactLinks} />

        <label style={fieldLabel}>Cores</label>
        <div>
          {CORES.map((c) => (
            <button key={c.id} type="button" style={colorBtn(colorScheme === c.id)} onClick={() => setColorScheme(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {precisaCatalogo && (
          <>
            <label style={fieldLabel}>Catálogo</label>
            {catalogItems.map((item, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Nome" value={item.name || ""} onChange={(e) => updateCatalogItem(i, "name", e.target.value)} />
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Preço" value={item.price || ""} onChange={(e) => updateCatalogItem(i, "price", e.target.value)} />
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Descrição" value={item.description || ""} onChange={(e) => updateCatalogItem(i, "description", e.target.value)} />
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Link da imagem" value={item.image_url || ""} onChange={(e) => updateCatalogItem(i, "image_url", e.target.value)} />
                <button type="button" onClick={() => removeCatalogItem(i)} style={{ background: "none", border: "none", color: C.red, fontSize: 12.5, cursor: "pointer" }}>Remover</button>
              </div>
            ))}
            <button type="button" onClick={addCatalogItem} style={{ ...ghostBtn, width: "100%" }}>
              + Adicionar item
            </button>
          </>
        )}

        {precisaGaleria && (
          <>
            <label style={fieldLabel}>Galeria</label>
            {galleryItems.map((item, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Link da imagem" value={item.image_url || ""} onChange={(e) => updateGalleryItem(i, "image_url", e.target.value)} />
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Legenda" value={item.caption || ""} onChange={(e) => updateGalleryItem(i, "caption", e.target.value)} />
                <button type="button" onClick={() => removeGalleryItem(i)} style={{ background: "none", border: "none", color: C.red, fontSize: 12.5, cursor: "pointer" }}>Remover</button>
              </div>
            ))}
            <button type="button" onClick={addGalleryItem} style={{ ...ghostBtn, width: "100%" }}>
              + Adicionar foto
            </button>
          </>
        )}

        {saveMsg && <div style={{ fontSize: 13, color: C.ink, marginTop: 10 }}>{saveMsg}</div>}

        <button onClick={guardar} disabled={saving} style={{ ...navBtn, width: "100%", marginTop: 16 }}>
          {saving ? "A guardar…" : "Guardar alterações"}
        </button>

        {(domainChoice === "netlify" || domainChoice === "proprio") && (
          <a
            href={api.siteBuildDownloadUrl(buildId)}
            style={{ ...ghostBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", marginTop: 10 }}
          >
            Descarregar site atualizado
          </a>
        )}

        {domainChoice === "d3na" && (
          <div style={{ marginTop: 10 }}>
            {publishStatus === "atualizacao_pedida" ? (
              <div style={{ fontSize: 12.5, color: C.inkSoft, textAlign: "center" }}>
                Pedido enviado — aguarda a atualização do site.
              </div>
            ) : (
              <button onClick={pedirAtualizacao} disabled={requestingUpdate} style={{ ...ghostBtn, width: "100%" }}>
                {requestingUpdate ? "A enviar…" : "Pedir atualização do site"}
              </button>
            )}
            {siteUrl && (
              <a href={siteUrl} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", fontSize: 12.5, color: C.navy, marginTop: 8 }}>
                Ver o site publicado
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
