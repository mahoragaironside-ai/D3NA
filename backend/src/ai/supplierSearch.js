import { SERPER_API_KEY, GROQ_API_KEY } from "../config.js";

// Pesquisa de fornecedores — Serper.dev faz a pesquisa real (resultados do Google),
// um modelo Groq normal escreve a resposta final, formatada em lista com links clicáveis.

const SUPPLIER_SYSTEM_PROMPT = `És um motor de pesquisa de fornecedores para um pequeno
empreendedor angolano. Vais receber RESULTADOS DE PESQUISA REAIS DA INTERNET — a tua tarefa é
EXTRAIR dessas fontes os fornecedores relevantes, nunca inventar nada que não esteja lá.

RESPONDE APENAS COM JSON VÁLIDO, SEM TEXTO À VOLTA, NESTE FORMATO EXACTO:
{
  "found": true ou false,
  "referencePrice": número ou null,
  "message": "texto curto, só quando found=false ou quando há algo importante a avisar, senão null",
  "suppliers": [
    {
      "name": "nome do fornecedor ou loja",
      "price": "valor em Kwanzas, texto curto, ex: '2.500 Kz'",
      "location": "bairro/cidade, ou 'não especificado'",
      "contactType": "whatsapp" ou "website" ou "other",
      "contactUrl": "URL completo, wa.me/... para whatsapp",
      "reputation": "nota curta sobre reputação, ou null se não houver informação"
    }
  ]
}

REGRAS OBRIGATÓRIAS:
- Se o utilizador mencionar um preço que já encontrou/paga (referencePrice), inclui NO ARRAY
  suppliers APENAS fornecedores com preço estritamente MENOR que esse valor. Nunca incluas
  fornecedores a preço igual ou superior ao referencePrice.
- Se não encontrares NENHUM fornecedor mais barato que o referencePrice, define found=false,
  suppliers=[] e message a explicar isso claramente (ex: "Não encontrei fornecedores com preço
  abaixo de X Kz — o preço que já tens parece ser competitivo.").
- Usa a localização específica dada pelo utilizador (bairro/cidade), não a província ou país,
  excepto se for pesquisa de importação, nesse caso usa os preços do país de origem do produto.
- Máximo 10 fornecedores, ordenados do mais barato para o mais caro.
- NUNCA menciones de onde tiraste a informação (não digas "site X", "Facebook") — isso fica só
  no contactUrl.
- Sem emojis, sem floreios, tom directo e profissional, nada que pareça "gerado por IA".
- Usa APENAS informação presente nos resultados fornecidos — nunca inventes preços, nomes ou
  contactos.
- Se um resultado for claramente antigo (mais de 1-2 anos), não o incluas, a não ser que seja a
  única opção disponível — nesse caso adiciona uma nota em reputation.
`;

async function serperSearch(query) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: "ao",
      hl: "pt",
      num: 15,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro na pesquisa Serper: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.organic || [];
}

function formatarResultados(resultados, rotulo) {
  if (resultados.length === 0) return `\n[${rotulo}] — nenhum resultado encontrado.\n`;
  return `\n[${rotulo}]\n` + resultados.map((r, i) =>
    `${i + 1}. ${r.title}\nFonte: ${r.link}\nResumo: ${(r.snippet || "").slice(0, 400)}`
  ).join("\n\n");
}

async function comRetry(fn, tentativas = 4) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimoErro = e;
      const is429 = e.message?.includes("429") || e.message?.includes("Rate limit");
      if (i < tentativas - 1) {
        const espera = is429 ? 4000 + i * 2000 : 1200;
        await new Promise((r) => setTimeout(r, espera));
      }
    }
  }
  throw ultimoErro;
}

export async function findSuppliers({ productName, location, isImport, notes }) {
  if (!SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY não configurada — a pesquisa de fornecedores não está disponível.");
  }
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada — a pesquisa de fornecedores não está disponível.");
  }

  let contextoPesquisa = "";

  if (isImport) {
    const [fornecedores, agentes] = await Promise.all([
      comRetry(() => serperSearch(`${productName} wholesale supplier factory export to Angola price contact`)),
      comRetry(() => serperSearch(`import agent customs broker Angola ${productName} shipping`)),
    ]);
    contextoPesquisa =
      formatarResultados(fornecedores, "Fornecedores internacionais") +
      formatarResultados(agentes, "Agentes de importação / despachantes");
  } else {
    const resultados = await comRetry(() => serperSearch(`${productName} fornecedor preço contacto ${location}`));
    contextoPesquisa = formatarResultados(resultados, "Fornecedores locais");
  }

  const userQuery = isImport
    ? `Produto a importar: ${productName}.${notes ? ` Contexto: ${notes}.` : ""}\n\nResultados de pesquisa:\n${contextoPesquisa}`
    : `Produto: ${productName}. Localização: ${location}.${notes ? ` Contexto: ${notes}.` : ""}\n\nResultados de pesquisa:\n${contextoPesquisa}`;

  const data = await comRetry(async () => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SUPPLIER_SYSTEM_PROMPT },
          { role: "user", content: userQuery },
        ],
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao escrever resposta: ${response.status} ${errText}`);
    }
    return response.json();
  });

  const raw = data.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    parsed = { found: false, suppliers: [], message: "Não consegui organizar os resultados desta pesquisa." };
  }
  return {
    found: parsed.found !== false && (parsed.suppliers?.length > 0),
    referencePrice: parsed.referencePrice || null,
    message: parsed.message || null,
    suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
    searchedWeb: true,
  };
}
