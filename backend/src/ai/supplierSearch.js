// Pesquisa de fornecedores — usa o groq/compound-mini, que tem pesquisa na internet embutida.

const SUPPLIER_SYSTEM_PROMPT = `És um assistente de pesquisa de fornecedores para um pequeno
empreendedor angolano. Usa a pesquisa na internet disponível para encontrar fornecedores reais
e atuais do produto pedido.

REGRAS OBRIGATÓRIAS:
- Se te for dada uma localização (bairro/cidade/país), PRIORIZA fornecedores locais nessa área
  ou o mais próximo possível dela. Só alargues a pesquisa a nível nacional ou internacional se
  não encontrares nada local, e diz claramente que estás a alargar a pesquisa por essa razão.
- Se a pesquisa for explicitamente para importação: procura tanto fornecedores/fábricas
  internacionais com boa reputação e envio para Angola, COMO agentes de importação, despachantes
  ou pessoas/empresas que ajudam no processo de trazer mercadoria para Angola (desalfandegamento,
  transporte, etc.) — apresenta os dois tipos separadamente.
- SEMPRE que encontrares um fornecedor ou agente, tenta trazer também uma forma de contacto
  (telefone, WhatsApp, email, site, endereço) se a pesquisa mostrar essa informação. Se não
  encontrares contacto direto, diz isso e sugere o caminho mais provável para o contactar (ex:
  "disponível via [nome da plataforma]").
- NUNCA inventes nomes de fornecedores, preços, avaliações ou contactos. Só reportas o que
  encontrares mesmo na pesquisa.
- Para cada fornecedor/agente encontrado, indica: nome, onde está, o que a pesquisa diz sobre a
  reputação (se houver), faixa de preço se disponível, e o contacto encontrado.
- Se não encontrares informação suficiente sobre reputação, preço ou contacto, diz isso
  claramente em vez de adivinhar.
- Termina SEMPRE com um aviso curto a lembrar que a pessoa deve confirmar reputação e condições
  diretamente com o fornecedor antes de pagar qualquer adiantamento — a pesquisa é um ponto de
  partida, não uma garantia.
- Responde em português, de forma direta e organizada (lista curta), sem floreios.
- IMPORTANTE: quando formulares os termos de pesquisa na internet (a pesquisa em si, não a
  resposta final), usa termos em INGLÊS — isto tende a devolver muito mais resultados e reduz
  falhas técnicas da ferramenta de pesquisa. A tua RESPOSTA FINAL ao utilizador continua sempre
  em português.`;

export async function findSuppliers({ productName, location, isImport, notes }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada — a pesquisa de fornecedores não está disponível.");
  }

  const userQuery = isImport
    ? `Procura fornecedores internacionais confiáveis para importar: ${productName}, com boa reputação e que enviem para Angola. Procura também agentes de importação ou despachantes que ajudem neste processo. Traz contactos sempre que encontrares.${notes ? ` Contexto: ${notes}.` : ""}`
    : `Procura fornecedores locais para: ${productName}, na zona de ${location}. Traz contactos (telefone/WhatsApp/site) sempre que encontrares.${notes ? ` Contexto: ${notes}.` : ""}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "groq/compound",
      messages: [
        { role: "system", content: SUPPLIER_SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (errText.includes("rate_limit")) {
      throw new Error("Estamos com muito tráfego neste momento. Espera uns 20 segundos e tenta outra vez.");
    }
    throw new Error(`Erro na pesquisa de fornecedores: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "Não encontrei resultados úteis para esta pesquisa.";
  const executedTools = data.choices?.[0]?.message?.executed_tools || [];
  const searchedWeb = executedTools.some((t) => t.type === "web_search" || t.name === "web_search");

  return { content, searchedWeb };
}
