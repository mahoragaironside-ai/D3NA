import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { api } from "../api.js";
import { C } from "../tokens.js";
import MiniPreview from "../components/MiniPreview.jsx";
import LogoPreview from "../components/LogoPreview.jsx";

const NEGOCIOS = {
  vendas: ["Cosméticos", "Infoprodutos", "Roupas", "Utensílios", "Eletrónicos"],
  servicos: [
    "Soldadura industrial", "Designer", "Serralheiro", "Eletricista", "Costureiro",
    "Biscateiro", "Jardinagem", "Limpeza", "Carpintaria", "Pedreiro",
    "Ladrilhagem", "Montagem de teto falso", "Pastelaria", "Cozinheiro",
  ],
};

const CORES = [
  { id: "azul", primary: "#16305C", secondary: "#FFFFFF", label: "Azul & Branco" },
  { id: "verde", primary: "#1E7A52", secondary: "#F5F6F8", label: "Verde & Cinza claro" },
  { id: "grafite", primary: "#15181F", secondary: "#E0AA4E", label: "Grafite & Dourado" },
  { id: "vinho", primary: "#7A1E2E", secondary: "#FFFFFF", label: "Vinho & Branco" },
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

export default function SiteBuilder() {
  const [step, setStep] = useState(1);
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [structureChoice, setStructureChoice] = useState(null);
  const [styleChoice, setStyleChoice] = useState(null);
  const [domainChoice, setDomainChoice] = useState("");
  const [tier, setTier] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [logoChoice, setLogoChoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  async function checkStatus(buildId) {
    setChecking(true);
    try {
      const s = await api.getSiteBuildStatus(buildId);
      setStatus(s.payment_status);
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const r = await api.createSiteBuild({
        business_category: businessCategory,
        business_type: businessType,
        color_scheme: colorScheme,
        structure_choice: structureChoice,
        style_choice: styleChoice,
        domain_choice: domainChoice,
        tier,
        company_name: companyName,
        company_description: companyDescription,
        contact_info: contactInfo,
        logo_choice: logoChoice,
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
    1: businessCategory && businessType,
    2: !!colorScheme,
    3: !!structureChoice,
    4: !!styleChoice,
    5: !!domainChoice,
    6: !!tier,
    7: companyName && contactInfo && !!logoChoice,
    8: true,
  };

  const wrap = { minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif", display: "flex", justifyContent: "center", padding: "24px 16px" };
  const card = { background: C.surface, borderRadius: 16, padding: 24, width: 420, maxWidth: "100%", boxSizing: "border-box" };
  const title = { fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 4 };
  const subtitle = { fontSize: 13, color: C.inkSoft, marginBottom: 18 };
  const optBtn = (active) => ({
    display: "block", width: "100%", textAlign: "left", background: active ? C.navySoft : C.bg,
    border: `1px solid ${active ? C.navy : C.border}`, borderRadius: 10, padding: "10px 14px",
    marginBottom: 8, cursor: "pointer", color: C.ink, fontSize: 14,
  });
  const navRow = { display: "flex", justifyContent: "space-between", marginTop: 20 };
  const navBtn = { background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const backBtn = { background: "none", border: "none", color: C.inkSoft, fontSize: 14, cursor: "pointer" };
  const selectedColor = CORES.find((c) => c.id === colorScheme) || CORES[0];

  if (result) {
    return (
      <div style={wrap}>
        <div style={card}>
          {status === "confirmado" ? (
            <>
              <div style={title}>Pagamento confirmado ✅</div>
              <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                O teu site está a ser preparado. Entra em contacto pelo mesmo número que
                indicaste ({contactInfo}) para receberes o ficheiro/acesso final.
              </p>
            </>
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
        <div style={{ fontSize: 11, color: C.inkSoft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Construtor de sites · Passo {step} de 8
        </div>

        {step === 1 && (
          <>
            <div style={title}>Qual é o seu negócio?</div>
            <div style={subtitle}>Escolhe a categoria e depois o tipo exato.</div>
            <button style={optBtn(businessCategory === "vendas")} onClick={() => { setBusinessCategory("vendas"); setBusinessType(""); }}>Vendas</button>
            <button style={optBtn(businessCategory === "servicos")} onClick={() => { setBusinessCategory("servicos"); setBusinessType(""); }}>Prestação de serviços</button>
            {businessCategory && !businessType && (
              <div style={{ marginTop: 12 }}>
                {NEGOCIOS[businessCategory].map((t) => (
                  <button key={t} style={optBtn(businessType === t)} onClick={() => setBusinessType(t)}>{t}</button>
                ))}
              </div>
            )}
            {businessType && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.navySoft, borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{businessType}</span>
                <button onClick={() => setBusinessType("")} style={{ background: "none", border: "none", color: C.navy, fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}>Trocar</button>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div style={title}>Cores do site</div>
            <div style={subtitle}>Cor principal e cor secundária.</div>
            {CORES.map((c) => (
              <button key={c.id} style={optBtn(colorScheme === c.id)} onClick={() => setColorScheme(c.id)}>
                <span style={{ display: "inline-flex", gap: 4, marginRight: 8, verticalAlign: "middle" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.primary, display: "inline-block" }} />
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.secondary, display: "inline-block", border: `1px solid ${C.border}` }} />
                </span>
                {c.label}
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <div style={title}>Estrutura do site</div>
            <div style={subtitle}>Como as secções do site se organizam. A pré-visualização atualiza-se sozinha.</div>
            <div style={{ marginBottom: 14 }}>
              <MiniPreview structureId={structureChoice || 1} styleId={styleChoice || 1} primary={selectedColor.primary} secondary={selectedColor.secondary} companyName={companyName} />
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
              <MiniPreview structureId={structureChoice || 1} styleId={styleChoice || 1} primary={selectedColor.primary} secondary={selectedColor.secondary} companyName={companyName} />
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
            <div style={title}>Onde vai ficar o site?</div>
            <div style={subtitle}>Em ambos os casos recebes um ficheiro para descarregar depois do pagamento.</div>
            <button style={optBtn(domainChoice === "blogger")} onClick={() => setDomainChoice("blogger")}>
              <div style={{ fontWeight: 600 }}>Blogger do Google (grátis)</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Recebes um ficheiro XML para importar no teu blog</div>
            </button>
            <button style={optBtn(domainChoice === "proprio")} onClick={() => setDomainChoice("proprio")}>
              <div style={{ fontWeight: 600 }}>Domínio próprio</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Ex: teunegocio.com — recebes os ficheiros do site prontos</div>
            </button>
            {domainChoice === "blogger" && (
              <div style={{ background: C.navySoft, borderRadius: 10, padding: 12, marginTop: 8, fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>
                Já tens um blog criado no Blogger (blogger.com)? Depois de receberes o ficheiro,
                vais a <strong>Configurações → Gerir blog → Importar e fazer cópia de segurança</strong>
                no teu blog para o inserir. Se ainda não tens blog, cria um gratuito em blogger.com
                antes de importares o ficheiro.
              </div>
            )}
          </>
        )}

        {step === 6 && (
          <>
            <div style={title}>Nível do site</div>
            <button style={optBtn(tier === "basico")} onClick={() => setTier("basico")}>
              <div style={{ fontWeight: 700 }}>Básico — 1.500 Kz</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Efeitos visuais + catálogo</div>
            </button>
            <button style={optBtn(tier === "pro")} onClick={() => setTier("pro")}>
              <div style={{ fontWeight: 700 }}>Pro — 25.000 Kz</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Efeitos visuais + catálogo + domínio próprio + IA + sem anúncios + automação + tráfego pago incluído</div>
            </button>
          </>
        )}

        {step === 7 && (
          <>
            <div style={title}>Dados da empresa</div>
            <input placeholder="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 10 }} />
            <textarea placeholder="Descrição curta" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 10, minHeight: 70, resize: "none" }} />
            <input placeholder="Contacto (WhatsApp/telefone)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14 }} />
            <LogoPreview name={companyName} primary={selectedColor.primary} secondary={selectedColor.secondary} selected={logoChoice} onSelect={setLogoChoice} />
          </>
        )}

        {step === 8 && (
          <>
            <div style={title}>Confere tudo antes de pagar</div>
            <div style={subtitle}>É assim que o site vai ficar. Se algo não estiver bem, volta atrás e muda.</div>
            <MiniPreview big structureId={structureChoice} styleId={styleChoice} primary={selectedColor.primary} secondary={selectedColor.secondary} companyName={companyName} />
            <div style={{ marginTop: 14, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.9 }}>
              <div><strong style={{ color: C.ink }}>Negócio:</strong> {businessType}</div>
              <div><strong style={{ color: C.ink }}>Cores:</strong> {selectedColor.label}</div>
              <div><strong style={{ color: C.ink }}>Estrutura:</strong> {ESTRUTURAS.find((e) => e.id === structureChoice)?.label}</div>
              <div><strong style={{ color: C.ink }}>Estilo:</strong> {ESTILOS.find((e) => e.id === styleChoice)?.label}</div>
              <div><strong style={{ color: C.ink }}>Onde vai ficar:</strong> {domainChoice === "blogger" ? "Blogger do Google" : "Domínio próprio"}</div>
              <div><strong style={{ color: C.ink }}>Nível:</strong> {tier === "pro" ? "Pro — 25.000 Kz" : "Básico — 1.500 Kz"}</div>
            </div>
          </>
        )}

        {error && <div style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{error}</div>}

        <div style={navRow}>
          {step > 1 ? <button style={backBtn} onClick={() => setStep((s) => s - 1)}>Voltar</button> : <span />}
          {step < 8 ? (
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
