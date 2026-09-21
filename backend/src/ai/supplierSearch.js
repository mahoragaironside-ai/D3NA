// Pesquisa de fornecedores — Serper.dev faz a pesquisa real (resultados do Google),
// um modelo Groq normal escreve a resposta final, formatada em lista com links clicáveis.

const SUPPLIER_SYSTEM_PROMPT = `És um assistente de pesquisa de fornecedores para um pequeno
empreendedor angolano. Vais receber RESULTADOS DE PESQUISA REAIS DA INTERNET — a tua tarefa é
ESCREVER a resposta final a partir DESSES resultados, nunca inventar nada que não esteja lá.

FORMATO OBRIGATÓRIO DA RESPOSTA (segue isto à risca):
- Lista numerada, NUNCA uma tabela markdown (tabelas ficam ilegíveis em ecrãs pequenos).
- Para cada fornecedor, exactamente este formato:

**1. Nome do fornecedor**
📍 Localização: [cidade/bairro ou "não especificado"]
💰 Preço: [valor ou "não disponível"]
⭐ Reputação: [o que os resultados dizem, ou "sem informação — recomenda-se confirmar antes de negociar"]
[📱 Contactar via WhatsApp](https://wa.me/NUMERO) — ou, se não houver WhatsApp, [🔗 Ver site/contacto](URL)

- NUNCA menciones onde encontraste a informação (não digas "site X", "Facebook", "Instagram" como
  fonte) — o link clicável já resolve isso, não precisas de nomear a plataforma no texto.
- Máximo de 10 a 15 fornecedores no total — escolhe os MELHORES (mistura de preço baixo E boa
  reputação/informação completa), não despejes tudo o que a pesquisa trouxe. Ignora resultados
  fracos (sem contacto nem preço nem localização) se já tiveres opções melhores suficientes.
- ORDENA a lista: primeiro os que têm melhor equilíbrio preço/qualidade, não por ordem aleatória.
- Se a pessoa mencionar um preço de referência que já paga hoje, procura ACTIVAMENTE por opções
  mais baratas nos resultados e destaca-as no topo com "💚 Mais barato que o teu preço actual".
- Se for pesquisa de importação: separa claramente "FORNECEDORES INTERNACIONAIS" de "AGENTES DE
  IMPORTAÇÃO/DESPACHANTES" com um subtítulo em negrito entre os dois grupos.
- Se um resultado for claramente antigo, avisa que pode estar desatualizado.
- Usa APENAS informação presente nos resultados fornecidos — nunca inventes preços, nomes ou
  contactos que não estejam lá.
- Termina SEMPRE com uma linha curta a lembrar que a pessoa deve confirmar reputação e condições
  diretamente com o fornecedor antes de pagar qualquer adiantamento.
- Responde em português, direto, sem floreios, sem introduções longas.`;

async function serperSearch(query) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
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

async function comRetry(fn, tentativas = 2) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimoErro = e;
      if (i < tentativas - 1) await new Promise((r) => setTimeout(r, 1200));
    }
  }
  throw ultimoErro;
}

export async function findSuppliers({ productName, location, isImport, notes }) {
  if (!process.env.SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY não configurada — a pesquisa de fornecedores não está disponível.");
  }
  if (!process.env.GROQ_API_KEY) {
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
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
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

  const content = data.choices?.[0]?.message?.content || "Não encontrei resultados úteis para esta pesquisa.";
  return { content, searchedWeb: true };
}
