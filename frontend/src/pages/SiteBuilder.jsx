import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { api } from "../api.js";
import ReviewModal from "../components/ReviewModal.jsx";
import { C } from "../tokens.js";
import MiniPreview from "../components/MiniPreview.jsx";
import LogoPreview from "../components/LogoPreview.jsx";
import ContactLinksPicker from "../components/ContactLinksPicker.jsx";
import OptionPicker from "../components/OptionPicker.jsx";

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
  { id: "rosa", primary: "#C2185B", secondary: "#FFF0F5", label: "Rosa & Rosa claro" },
  { id: "turquesa", primary: "#0E8388", secondary: "#EAFBFB", label: "Turquesa & Gelo" },
  { id: "esmeralda", primary: "#065F46", secondary: "#ECFDF5", label: "Esmeralda & Verde claro" },
  { id: "ameixa", primary: "#6B2D5C", secondary: "#FBF0F8", label: "Ameixa & Lilás claro" },
  { id: "marinho", primary: "#0B1F3A", secondary: "#F4F1E8", label: "Marinho & Marfim" },
  { id: "oliva", primary: "#556B2F", secondary: "#FAFBF0", label: "Oliva & Creme" },
  { id: "ardosia", primary: "#334155", secondary: "#F1F5F9", label: "Ardósia & Cinza claro" },
  { id: "pessego", primary: "#C96A4D", secondary: "#FFF3EC", label: "Pêssego & Creme" },
  { id: "bordo", primary: "#5C0A1E", secondary: "#FBEFF1", label: "Bordô & Rosa pálido" },
  { id: "menta", primary: "#0F766E", secondary: "#ECFFFC", label: "Menta & Branco gelo" },
  { id: "chumboneon", primary: "#121212", secondary: "#39FF88", label: "Chumbo & Verde néon" },
  { id: "areia", primary: "#8A7158", secondary: "#FBF8F3", label: "Areia & Branco quente" },
  { id: "ceu", primary: "#1C6DD0", secondary: "#EAF4FF", label: "Céu & Branco gelo" },
  { id: "carmesim", primary: "#B0102A", secondary: "#FFF1F2", label: "Carmesim & Rosa suave" },
  { id: "safira", primary: "#0B3D91", secondary: "#EAF0FF", label: "Safira & Branco gelo" },
  { id: "cobre", primary: "#9C4A1A", secondary: "#FFF4EC", label: "Cobre & Creme" },
  { id: "chumbo", primary: "#2B2B2B", secondary: "#FFFFFF", label: "Chumbo & Branco" },
  { id: "lavanda", primary: "#7C6FAE", secondary: "#F6F3FC", label: "Lavanda & Branco lilás" },
  { id: "floresta", primary: "#14432A", secondary: "#F1F8F3", label: "Floresta & Verde claro" },
  { id: "pretodourado", primary: "#000000", secondary: "#D4AF37", label: "Preto & Dourado" },
];

const ESTRUTURAS = [
  { id: 1, label: "Capa + sobre + contacto", desc: "Simples, direta ao ponto" },
  { id: 2, label: "Capa + catálogo + contacto", desc: "Foco nos produtos/serviços" },
  { id: 3, label: "Capa + sobre + catálogo + contacto", desc: "Completa" },
  { id: 4, label: "Capa + galeria + testemunhos + contacto", desc: "Foco visual" },
  { id: 5, label: "Página única com tudo", desc: "Scroll único, tudo numa página" },
];

const ESTILOS = [
  { id: 1, label: "Minimalista", desc: "Espaços amplos, poucos elementos" },
  { id: 2, label: "Clássico institucional", desc: "Sóbrio, formal" },
  { id: 3, label: "Moderno com destaque de cor", desc: "Blocos de cor fortes" },
  { id: 4, label: "Editorial (revista)", desc: "Foco em imagens grandes" },
  { id: 5, label: "Cartão/loja", desc: "Grelha tipo catálogo de produtos" },
];

const FONTES = [
  { id: "sistema", label: "Sistema (padrão)", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { id: "classica", label: "Clássica (serifada)", family: "Georgia, 'Times New Roman', serif" },
  { id: "moderna", label: "Moderna", family: "'Trebuchet MS', 'Segoe UI', sans-serif" },
  { id: "maquina", label: "Máquina de escrever", family: "'Courier New', Courier, monospace" },
  { id: "elegante", label: "Elegante", family: "Garamond, 'Times New Roman', serif" },
  { id: "arredondada", label: "Arredondada", family: "Verdana, Geneva, sans-serif" },
  { id: "impacto", label: "Impacto", family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { id: "tradicional", label: "Tradicional", family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { id: "tecnica", label: "Técnica", family: "'Lucida Console', Monaco, monospace" },
  { id: "suave", label: "Suave", family: "Tahoma, Geneva, sans-serif" },
];

const TIERS = [
  { id: "basico", label: "Básico", price: "1.500 Kz" },
  { id: "pro", label: "Pro", price: "25.000 Kz", tag: "PREMIUM", destaque: true },
  { id: "personalizado", label: "Personalizado", price: "Em breve", disabled: true },
];

// Itens de exemplo automáticos — a pessoa não insere fotos/produtos no wizard;
// isso fica para o futuro painel de controlo. As imagens são placeholders
// genéricos (placehold.co), não fotos reais, só para dar corpo à pré-visualização.
function gerarItensExemplo(tipo, corPrimaria, nomeNegocio) {
  const cor = (corPrimaria || "16305C").replace("#", "");
  const base = nomeNegocio || (tipo === "catalogo" ? "Produto" : "Foto");
  if (tipo === "catalogo") {
    return [1, 2, 3, 4].map((n) => ({
      name: `${base} ${n}`,
      price: "1000",
      description: "Imagem de exemplo — substitui pelas tuas fotos reais no painel de gestão.",
      image_url: `https://placehold.co/400x400/${cor}/ffffff?text=Exemplo+${n}`,
    }));
  }
  return [1, 2, 3, 4].map((n) => ({
    image_url: `https://placehold.co/500x500/${cor}/ffffff?text=Exemplo+${n}`,
    caption: `Foto de exemplo ${n}`,
  }));
}

export default function SiteBuilder() {
  const [step, setStep] = useState(1);
  const [colorScheme, setColorScheme] = useState("");
  const [fontChoice, setFontChoice] = useState("");
  const [structureChoice, setStructureChoice] = useState(null);
  const [styleChoice, setStyleChoice] = useState(null);
  const [domainChoice, setDomainChoice] = useState("");
  const [tier, setTier] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactLinks, setContactLinks] = useState([]);
  const [logoChoice, setLogoChoice] = useState(null);
  const [panelPassword, setPanelPassword] = useState("");
  const [panelPasswordConfirm, setPanelPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [siteUrl, setSiteUrl] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showReview, setShowReview] = useState(false);

  const precisaCatalogo = [2, 3, 5].includes(structureChoice);
  const precisaGaleria = structureChoice === 4;

  async function checkStatus(buildId) {
    setChecking(true);
    try {
      const s = await api.getSiteBuildStatus(buildId);
      setStatus(s.payment_status);
      setPublishStatus(s.publish_status);
      setSiteUrl(s.site_url);
      if (s.payment_status === "confirmado" && !localStorage.getItem("review_done_" + buildId)) {
        setShowReview(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function carregarPreview() {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const cor = (CORES.find((c) => c.id === colorScheme) || CORES[0]).primary;
      const catalogAuto = precisaCatalogo ? gerarItensExemplo("catalogo", cor, companyName) : [];
      const galleryAuto = precisaGaleria ? gerarItensExemplo("galeria", cor, companyName) : [];
      const html = await api.previewSiteBuild({
        color_scheme: colorScheme,
        font_choice: fontChoice,
        structure_choice: structureChoice,
        style_choice: styleChoice,
        company_name: companyName,
        company_description: companyDescription,
        contact_links: JSON.stringify(contactLinks),
        logo_choice: logoChoice,
        catalog_items: JSON.stringify(catalogAuto),
        gallery_items: JSON.stringify(galleryAuto),
      });
      setPreviewHtml(html);
    } catch (e) {
      setPreviewError(e.message || "Não foi possível carregar a pré-visualização.");
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    if (step === 6) carregarPreview();
  }, [step]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const cor = (CORES.find((c) => c.id === colorScheme) || CORES[0]).primary;
      const catalogAuto = precisaCatalogo ? gerarItensExemplo("catalogo", cor, companyName) : [];
      const galleryAuto = precisaGaleria ? gerarItensExemplo("galeria", cor, companyName) : [];
      const r = await api.createSiteBuild({
        color_scheme: colorScheme,
        font_choice: fontChoice,
        structure_choice: structureChoice,
        style_choice: styleChoice,
        domain_choice: domainChoice,
        tier,
        company_name: companyName,
        company_description: companyDescription,
        contact_links: JSON.stringify(contactLinks),
        logo_choice: logoChoice,
        catalog_items: JSON.stringify(catalogAuto),
        gallery_items: JSON.stringify(galleryAuto),
        panel_password: panelPassword,
      });
      localStorage.setItem("d3na_site_build_id", r.build_id);
      setResult(r);
      setStatus("pendente");
    } catch (e) {
      setError(e.message || "Não foi possível submeter agora.");
    } finally {
      setSubmitting(false);
    }
  }

  const canNext = {
    1: !!colorScheme,
    2: !!fontChoice,
    3: !!structureChoice,
    4: !!styleChoice,
    5: companyName && contactLinks.length > 0 && !!logoChoice,
    6: true,
    7: !!domainChoice && panelPassword.length >= 4 && panelPassword === panelPasswordConfirm,
  };

  const wrap = { minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", display: "flex", justifyContent: "center", padding: "16px 12px" };
  const card = { background: C.surface, borderRadius: 16, padding: 18, width: 420, maxWidth: "100%", boxSizing: "border-box" };
  const title = { fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 4 };
  const subtitle = { fontSize: 12.5, color: C.inkSoft, marginBottom: 12 };
  const optBtn = (active) => ({
    display: "block", width: "100%", textAlign: "left", background: active ? C.navySoft : C.bg,
    border: `1px solid ${active ? C.navy : C.border}`, borderRadius: 10, padding: "8px 12px",
    marginBottom: 6, cursor: "pointer", color: C.ink, fontSize: 13.5,
  });
  const navRow = { display: "flex", justifyContent: "space-between", marginTop: 14 };
  const navBtn = { background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const backBtn = { background: "none", border: "none", color: C.inkSoft, fontSize: 14, cursor: "pointer" };
  const selectedColor = CORES.find((c) => c.id === colorScheme) || CORES[0];

  if (!tier) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={title}>Criar o meu site</div>
          <div style={{ ...subtitle, marginBottom: 20 }}>Escolhe o tipo de construção.</div>

          {TIERS.map((t) => {
            const conteudoBtn = (
              <button
                key={t.id}
                disabled={t.disabled}
                onClick={() => !t.disabled && setTier(t.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", textAlign: "left", boxSizing: "border-box",
                  background: t.destaque ? "#0d1b33" : C.bg,
                  color: t.destaque ? "#fff" : C.ink,
                  border: t.destaque ? "none" : `1px solid ${C.border}`,
                  borderRadius: 14, padding: "18px 18px",
                  cursor: t.disabled ? "default" : "pointer",
                  opacity: t.disabled ? 0.45 : 1,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>{t.label}</span>
                    {t.tag && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 800, letterSpacing: 1,
                        background: "linear-gradient(90deg, #E0AA4E, #fff6d9, #E0AA4E)",
                        color: "#15181F", padding: "3px 8px", borderRadius: 20,
                      }}>{t.tag}</span>
                    )}
                    {t.disabled && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: C.inkSoft, border: `1px solid ${C.border}`, padding: "3px 8px", borderRadius: 20 }}>EM BREVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{t.price}</div>
                </div>
                <span style={{ fontSize: 20, opacity: t.disabled ? 0.3 : 0.7 }}>›</span>
              </button>
            );

            if (!t.destaque) {
              return <div key={t.id} style={{ marginBottom: 12 }}>{conteudoBtn}</div>;
            }

            return (
              <div key={t.id} className="tier-pro-wrap" style={{ marginBottom: 12 }}>
                <div className="tier-pro-inner">{conteudoBtn}</div>
              </div>
            );
          })}

          <style>{`
            .tier-pro-wrap {
              padding: 2px; border-radius: 16px;
              background: linear-gradient(120deg, #E0AA4E, #16305C, #E0AA4E, #4b6fb0, #E0AA4E);
              background-size: 300% 300%;
              animation: ledTrace 3.5s linear infinite;
            }
            .tier-pro-inner { border-radius: 14px; overflow: hidden; }
            @keyframes ledTrace {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={wrap}>
        <div style={card}>
          {showReview && (
            <ReviewModal
              serviceType="construtor"
              referenceId={result && result.build_id}
              onClose={() => {
                localStorage.setItem("review_done_" + (result && result.build_id), "1");
                setShowReview(false);
              }}
            />
          )}
          {status === "confirmado" ? (
            domainChoice === "d3na" ? (
              publishStatus === "publicado" ? (
                <>
                  <div style={title}>O teu site está no ar ✅</div>
                  <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                    Já publicámos o teu site. Usa a password que criaste no wizard para
                    entrar no painel de controlo sempre que quiseres alterar algo.
                  </p>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...navBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none", marginTop: 10 }}
                  >
                    Abrir o meu site
                  </a>
                </>
              ) : (
                <>
                  <div style={title}>Pagamento confirmado ✅</div>
                  <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                    Estamos a publicar o teu site — demora cerca de 20 minutos. Volta
                    a verificar daqui a pouco.
                  </p>
                  <button
                    onClick={() => checkStatus(result.build_id)}
                    disabled={checking}
                    style={{ ...navBtn, background: C.surface, color: C.navy, border: `1px solid ${C.navy}`, width: "100%", marginTop: 10 }}
                  >
                    {checking ? "A verificar…" : "Verificar se já está pronto"}
                  </button>
                </>
              )
            ) : (
              <>
                <div style={title}>Pagamento confirmado ✅</div>
                <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                  O teu site já está pronto. Descarrega o ficheiro e segue as instruções
                  de publicação que escolheste.
                </p>
                <a
                  href={api.siteBuildDownloadUrl(result.build_id)}
                  style={{ ...navBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none", marginTop: 10 }}
                >
                  Descarregar o meu site
                </a>
              </>
            )
          ) : (
            <>
              <div style={title}>Falta só o pagamento</div>
              <p style={subtitle}>Plano {tier === "pro" ? "Pro — 25.000 Kz" : "Básico — 1.500 Kz"}</p>
              <Row label="Ref-X">
                <span style={{ fontWeight: 700 }}>{result.payment_reference}</span>
              </Row>
              <Row label="Valor">{Number(result.payment_amount).toLocaleString("pt-PT")} {result.payment_currency}</Row>
              <a href={result.payment_url} target="_blank" rel="noreferrer" style={{ ...navBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none", marginTop: 14 }}>
                Pagar com FaciPay <ExternalLink size={14} />
              </a>
              <button onClick={() => checkStatus(result.build_id)} disabled={checking} style={{ ...navBtn, background: C.surface, color: C.navy, border: `1px solid ${C.navy}`, width: "100%", marginTop: 10 }}>
                {checking ? "A verificar…" : "Já paguei, verificar"}
              </button>
              {status === "pendente" && (
                <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10 }}>
                  Ainda não confirmámos o pagamento. Normalmente demora até algumas horas depois de pagares.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 11, color: C.inkSoft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Construtor de sites · Passo {step} de 7</span>
          <button onClick={() => setTier("")} style={{ background: "none", border: "none", color: C.navy, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
            Plano {TIERS.find((t) => t.id === tier)?.label}
          </button>
        </div>

        {step === 1 && (
          <>
            <div style={title}>Cores do site</div>
            <div style={subtitle}>Cor principal e cor secundária.</div>
            <OptionPicker
              items={CORES}
              selectedId={colorScheme}
              onSelect={setColorScheme}
              getLabel={(c) => c.label}
              renderItem={(c) => (
                <span style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: c.primary, display: "inline-block" }} />
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: c.secondary, display: "inline-block", border: `1px solid ${C.border}` }} />
                </span>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            <div style={title}>Tipo de letra</div>
            <div style={subtitle}>A fonte usada em todo o texto do site. Combina com qualquer Estilo visual.</div>
            {FONTES.map((f) => (
              <button key={f.id} style={{ ...optBtn(fontChoice === f.id), fontFamily: f.family }} onClick={() => setFontChoice(f.id)}>
                <div style={{ fontWeight: 600 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, fontFamily: f.family }}>Exemplo: {companyName || "O Meu Negócio"}</div>
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <div style={title}>Estrutura do site</div>
            <div style={subtitle}>Como as secções do site se organizam. A pré-visualização atualiza-se sozinha.</div>
            <div style={{ marginBottom: 14 }}>
              <MiniPreview structureId={structureChoice || 1} styleId={styleChoice || 1} primary={selectedColor.primary} secondary={selectedColor.secondary} companyName={companyName} logoChoice={logoChoice} />
            </div>
            {ESTRUTURAS.map((e) => (
              <button key={e.id} style={optBtn(structureChoice === e.id)} onClick={() => setStructureChoice(e.id)}>
                <div style={{ fontWeight: 600 }}>{e.label}</div>
                <div style={{ fontSize: 12, color: C.inkSoft }}>{e.desc}</div>
              </button>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <div style={title}>Estilo visual</div>
            <div style={subtitle}>O acabamento e os pequenos efeitos. A pré-visualização atualiza-se sozinha.</div>
            <div style={{ marginBottom: 14 }}>
              <MiniPreview structureId={structureChoice || 1} styleId={styleChoice || 1} primary={selectedColor.primary} secondary={selectedColor.secondary} companyName={companyName} logoChoice={logoChoice} />
            </div>
            {ESTILOS.map((e) => (
              <button key={e.id} style={optBtn(styleChoice === e.id)} onClick={() => setStyleChoice(e.id)}>
                <div style={{ fontWeight: 600 }}>{e.label}</div>
                <div style={{ fontSize: 12, color: C.inkSoft }}>{e.desc}</div>
              </button>
            ))}
          </>
        )}

        {step === 5 && (
          <>
            <div style={title}>Dados da empresa</div>
            <input placeholder="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 10 }} />
            <textarea placeholder="Descrição curta" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 10, minHeight: 70, resize: "none" }} />
            <ContactLinksPicker value={contactLinks} onChange={setContactLinks} />
            <LogoPreview name={companyName} primary={selectedColor.primary} secondary={selectedColor.secondary} selected={logoChoice} onSelect={setLogoChoice} />
          </>
        )}

        {step === 6 && (
          <>
            <div style={title}>Confere tudo antes de pagar</div>
            <div style={subtitle}>É assim que o site vai ficar. Se algo não estiver bem, volta atrás e muda.</div>
            {previewLoading && (
              <div style={{ textAlign: "center", padding: "30px 0", color: C.inkSoft, fontSize: 13 }}>A gerar o teu site real…</div>
            )}
            {previewError && (
              <div style={{ color: C.red, fontSize: 13, padding: "12px 0" }}>{previewError}</div>
            )}
            {!previewLoading && !previewError && previewHtml && (
              <iframe
                title="Pré-visualização do site"
                srcDoc={previewHtml}
                style={{ width: "100%", height: 480, border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff" }}
              />
            )}
            <div style={{ marginTop: 14, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.9 }}>
              <div><strong style={{ color: C.ink }}>Plano:</strong> {TIERS.find((t) => t.id === tier)?.label}</div>
              <div><strong style={{ color: C.ink }}>Cores:</strong> {selectedColor.label}</div>
              <div><strong style={{ color: C.ink }}>Fonte:</strong> {FONTES.find((f) => f.id === fontChoice)?.label}</div>
              <div><strong style={{ color: C.ink }}>Estrutura:</strong> {ESTRUTURAS.find((e) => e.id === structureChoice)?.label}</div>
              <div><strong style={{ color: C.ink }}>Estilo:</strong> {ESTILOS.find((e) => e.id === styleChoice)?.label}</div>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div style={title}>Onde vai ficar o site?</div>
            <div style={subtitle}>Em qualquer caso, o teu site fica pronto assim que o pagamento for confirmado.</div>
            <button style={optBtn(domainChoice === "netlify")} onClick={() => setDomainChoice("netlify")}>
              <div style={{ fontWeight: 600 }}>Publicar grátis (recomendado)</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Sem hospedagem própria? Fica no ar em segundos, sem custos</div>
            </button>
            <button style={optBtn(domainChoice === "proprio")} onClick={() => setDomainChoice("proprio")}>
              <div style={{ fontWeight: 600 }}>Já tenho hospedagem</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Ex: teunegocio.com — recebes o ficheiro para carregares no teu servidor</div>
            </button>
            <button style={optBtn(domainChoice === "d3na")} onClick={() => setDomainChoice("d3na")}>
              <div style={{ fontWeight: 600 }}>A D3NA publica por mim</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Sem trabalho nenhum da tua parte — fica pronto cerca de 20 minutos depois do pagamento confirmado</div>
            </button>
            {domainChoice === "netlify" && (
              <div style={{ background: C.navySoft, borderRadius: 10, padding: 12, marginTop: 8, fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>
                Depois de receberes o ficheiro: vai a <strong>netlify.com/drop</strong>, arrasta o
                ficheiro para lá, e o site fica no ar em segundos — sem conta, sem custos. Se
                quiseres guardar esse link para sempre, cria uma conta grátis e clica em "Claim".
              </div>
            )}
            {domainChoice && (
              <div style={{ marginTop: 16 }}>
                <div style={{ ...title, fontSize: 15 }}>Password do teu painel de controlo</div>
                <div style={subtitle}>
                  Vais precisar dela para entrar no painel e gerir o site depois (cores, contactos, fotos).
                  Guarda-a bem — se a perderes, perdes o acesso ao painel para sempre.
                </div>
                <input
                  type="password"
                  placeholder="Cria uma password"
                  value={panelPassword}
                  onChange={(e) => setPanelPassword(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 8 }}
                />
                <input
                  type="password"
                  placeholder="Repete a password"
                  value={panelPasswordConfirm}
                  onChange={(e) => setPanelPasswordConfirm(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
                />
                {panelPassword && panelPasswordConfirm && panelPassword !== panelPasswordConfirm && (
                  <div style={{ color: C.red, fontSize: 12, marginTop: 6 }}>As passwords não coincidem.</div>
                )}
                {panelPassword && panelPassword.length < 4 && (
                  <div style={{ color: C.red, fontSize: 12, marginTop: 6 }}>Usa pelo menos 4 caracteres.</div>
                )}
              </div>
            )}
          </>
        )}

        {error && <div style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{error}</div>}

        <div style={navRow}>
          {step > 1 ? <button style={backBtn} onClick={() => setStep((s) => s - 1)}>Voltar</button> : <span />}
          {step < 7 ? (
            <button style={navBtn} disabled={!canNext[step]} onClick={() => setStep((s) => s + 1)}>Continuar</button>
          ) : (
            <button style={navBtn} disabled={!canNext[7] || submitting} onClick={submit}>
              {submitting ? "A enviar…" : "Construir site"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ color: C.ink }}>{children}</span>
    </div>
  );
}
