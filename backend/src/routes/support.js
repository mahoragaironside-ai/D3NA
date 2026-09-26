import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdminKey } from "../middleware/auth.js";
import { callChatModel } from "../ai/orchestrator.js";
import { logEvent } from "./activityLog.js";

const router = Router();

const SUPPORT_SYSTEM_PROMPT = `Es o assistente de apoio ao cliente do D3NA, uma plataforma angolana com tres servicos:
1. Consultoria Digital — chat com IA por subscricao semanal (planos Basico, Premium, Max), ajuda em negocios, marketing, decisoes.
2. Construtor de Sites — cria sites para negocios, pagamento unico, planos Basico/Pro.
3. Curso Online — em desenvolvimento, ainda nao lancado.

Pagamentos sao feitos via FaciPay (referencia Multicaixa), confirmados manualmente pelo dono, normalmente em algumas horas.

A tua funcao e responder a duvidas simples e reais do cliente sobre estes servicos: como funciona, precos,
como pagar, prazos, como usar. Se o cliente tiver um problema que nao consegues resolver com certeza
(reembolsos, reclamacao especifica sobre um pagamento que nao foi confirmado, erro tecnico, pedido fora do
que sabes, ou se o cliente pedir explicitamente para falar com uma pessoa), responde de forma simpatica e
inclui EXATAMENTE a palavra ESCALAR_HUMANO no fim da tua resposta (numa linha propria). Isso aciona o
encaminhamento automatico para o dono — nao expliques ao cliente que estas a usar essa palavra.
Nunca inventes informacao sobre precos ou prazos que nao tens a certeza.`;

function contemEscalada(texto) {
  return texto.includes("ESCALAR_HUMANO");
}

// Inicia uma conversa de suporte.
router.post("/start", requireAuth, async (req, res) => {
  const conv = await query(
    "INSERT INTO support_conversations (user_id) VALUES ($1) RETURNING *",
    [req.userId]
  );
  res.status(201).json(conv.rows[0]);
});

// Cliente envia mensagem — a IA responde, e escala automaticamente se necessario.
router.post("/:id/message", requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "Mensagem vazia." });

  const conv = await query("SELECT * FROM support_conversations WHERE conversation_id = $1", [req.params.id]);
  if (conv.rows.length === 0) return res.status(404).json({ error: "Conversa nao encontrada." });
  const conversation = conv.rows[0];

  await query(
    "INSERT INTO support_messages (conversation_id, sender, content) VALUES ($1, 'cliente', $2)",
    [conversation.conversation_id, content]
  );

  // Se ja esta escalado, o cliente esta a falar com o dono, nao com a IA.
  if (conversation.status === "escalado") {
    return res.json({ status: "escalado", resposta: null });
  }

  const historico = await query(
    "SELECT sender, content FROM support_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversation.conversation_id]
  );
  const messages = historico.rows.map((m) => ({
    role: m.sender === "cliente" ? "user" : "assistant",
    content: m.content,
  }));

  let respostaIA;
  try {
    respostaIA = await callChatModel({ system: SUPPORT_SYSTEM_PROMPT, messages, maxTokens: 500 });
  } catch (e) {
    respostaIA = "Desculpa, tive um problema tecnico agora. ESCALAR_HUMANO";
  }

  const escalar = contemEscalada(respostaIA);
  const respostaLimpa = respostaIA.replace("ESCALAR_HUMANO", "").trim();

  await query(
    "INSERT INTO support_messages (conversation_id, sender, content) VALUES ($1, 'ia', $2)",
    [conversation.conversation_id, respostaLimpa]
  );

  if (escalar) {
    await query(
      "UPDATE support_conversations SET status = 'escalado', updated_at = now() WHERE conversation_id = $1",
      [conversation.conversation_id]
    );
    await logEvent(req.userId, "apoio_escalado", { conversation_id: conversation.conversation_id });
  } else {
    await query("UPDATE support_conversations SET updated_at = now() WHERE conversation_id = $1", [conversation.conversation_id]);
  }

  res.json({ status: escalar ? "escalado" : "ia", resposta: respostaLimpa });
});

// Historico da conversa — usado pelo cliente para ver as mensagens.
router.get("/:id", requireAuth, async (req, res) => {
  const msgs = await query(
    "SELECT sender, content, created_at FROM support_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [req.params.id]
  );
  res.json(msgs.rows);
});

// Lista conversas escaladas — alimenta o painel administrativo.
router.get("/admin/pending", requireAdminKey, async (req, res) => {
  const result = await query(
    `SELECT c.conversation_id, c.status, c.updated_at, u.phone_number,
            (SELECT content FROM support_messages m WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1) AS ultima_mensagem
     FROM support_conversations c LEFT JOIN users u ON u.user_id = c.user_id
     WHERE c.status = 'escalado'
     ORDER BY c.updated_at DESC`
  );
  res.json(result.rows);
});

// Contagem para o sininho de notificacao no menu do painel.
router.get("/admin/unread-count", requireAdminKey, async (req, res) => {
  const result = await query("SELECT COUNT(*) AS c FROM support_conversations WHERE status = 'escalado'");
  res.json({ count: parseInt(result.rows[0].c, 10) });
});

// Historico completo, visto pelo admin.
router.get("/admin/:id", requireAdminKey, async (req, res) => {
  const msgs = await query(
    "SELECT sender, content, created_at FROM support_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [req.params.id]
  );
  res.json(msgs.rows);
});

// Admin responde diretamente ao cliente.
router.post("/admin/:id/reply", requireAdminKey, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "Mensagem vazia." });
  await query(
    "INSERT INTO support_messages (conversation_id, sender, content) VALUES ($1, 'admin', $2)",
    [req.params.id, content]
  );
  await query("UPDATE support_conversations SET updated_at = now() WHERE conversation_id = $1", [req.params.id]);
  res.json({ status: "enviado" });
});

// Admin marca como resolvido.
router.post("/admin/:id/resolve", requireAdminKey, async (req, res) => {
  await query("UPDATE support_conversations SET status = 'resolvido', updated_at = now() WHERE conversation_id = $1", [req.params.id]);
  res.json({ status: "resolvido" });
});

export default router;
