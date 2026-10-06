async function getPoint(pointId, userId) {
  const r = await query(
    `SELECT p.*, c.topic, c.level, COALESCE(u.status,'bloqueado') AS status
     FROM lesson_points p
     JOIN course_lessons l ON l.lesson_id = p.lesson_id
     JOIN user_courses c ON c.course_id = l.course_id
     LEFT JOIN user_point_progress u ON u.point_id = p.point_id AND u.user_id = $2
     WHERE p.point_id = $1 AND c.user_id = $2`,
    [pointId, userId]
  );
  return r.rows[0];
}

const EVAL_SYSTEM = `Es um professor que avalia se o aluno percebeu o ponto. Escreve em portugues. Devolve APENAS JSON:
{"understood":true|false,"feedback":"...","reexplanation":"..."}
Aprova (understood=true) se a ideia central esta suficientemente correcta, mesmo sem ser perfeita.
Se nao aprovar, reexplanation e uma explicacao nova, mais simples, com outro exemplo. Se aprovar, reexplanation e "".`;

// Confirmar entendimento de um ponto
router.post("/points/:pointId/answer", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const answer = String(req.body.answer || "").trim().slice(0, 500);
    if (answer.length < 10) return res.status(400).json({ error: "Escreve um pouco mais, com as tuas palavras." });
    const p = await getPoint(req.params.pointId, req.userId);
    if (!p) return res.status(404).json({ error: "Ponto nao encontrado." });
    if (p.status === "bloqueado") return res.status(403).json({ error: "Este ponto ainda esta bloqueado." });
    const text = await callChatModel({
      system: EVAL_SYSTEM,
      messages: [{ role: "user", content: `Ponto: ${p.title}\nExplicacao dada: ${JSON.stringify(p.explanation_parts)}\nPergunta: ${p.check_question}\nResposta do aluno: ${answer}` }],
      maxTokens: 700,
      jsonMode: true,
    });
    const ev = parseJson(text);
    const ok = !!ev.understood;
    await query(
      `UPDATE user_point_progress SET attempts = attempts + 1, last_answer = $3, last_feedback = $4,
       status = $5, updated_at = now() WHERE user_id = $1 AND point_id = $2`,
      [req.userId, p.point_id, answer, ev.feedback || "", ok ? "compreendido" : "em_andamento"]
    );
    let lessonDone = false;
    if (ok) {
      const nx = await query(`SELECT point_id FROM lesson_points WHERE lesson_id = $1 AND position = $2`, [p.lesson_id, p.position + 1]);
      if (nx.rowCount) {
        await query(
          `UPDATE user_point_progress SET status = 'em_andamento', updated_at = now()
           WHERE user_id = $1 AND point_id = $2 AND status = 'bloqueado'`,
          [req.userId, nx.rows[0].point_id]
        );
      } else lessonDone = true;
    }
    res.json({ understood: ok, feedback: ev.feedback || "", reexplanation: ok ? null : ev.reexplanation || "", lesson_done: lessonDone });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel avaliar a resposta. Tenta de novo." });
  }
});

// Tirar uma duvida sobre um ponto
router.post("/points/:pointId/doubt", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const question = String(req.body.question || "").trim().slice(0, 500);
    if (question.length < 3) return res.status(400).json({ error: "Escreve a tua duvida." });
    const p = await getPoint(req.params.pointId, req.userId);
    if (!p) return res.status(404).json({ error: "Ponto nao encontrado." });
    if (p.status === "bloqueado") return res.status(403).json({ error: "Este ponto ainda esta bloqueado." });
    const answer = await callChatModel({
      system: "Es um professor paciente. Responde em portugues, de forma curta e simples, com um exemplo. Se nao tiveres certeza, di-lo.",
      messages: [{ role: "user", content: `Curso: ${p.topic}\nPonto: ${p.title}\nExplicacao: ${JSON.stringify(p.explanation_parts)}\nDuvida do aluno: ${question}` }],
      maxTokens: 600,
    });
    await query(
      `UPDATE user_point_progress SET doubts = COALESCE(doubts, '[]'::jsonb) || $3::jsonb, updated_at = now()
       WHERE user_id = $1 AND point_id = $2`,
      [req.userId, p.point_id, JSON.stringify([{ q: question, a: answer }])]
    );
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel responder. Tenta de novo." });
  }
});

async function lessonOwned(lessonId, userId) {
  const r = await query(
    `SELECT l.*, c.topic, c.level FROM course_lessons l
     JOIN user_courses c ON c.course_id = l.course_id
     WHERE l.lesson_id = $1 AND c.user_id = $2`,
    [lessonId, userId]
  );
  return r.rows[0];
}

// Gerar o teste da aula (so depois de todos os pontos compreendidos)
router.post("/lessons/:lessonId/test", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const l = await lessonOwned(req.params.lessonId, req.userId);
    if (!l) return res.status(404).json({ error: "Aula nao encontrada." });
    const pend = await query(
      `SELECT 1 FROM lesson_points p
       LEFT JOIN user_point_progress u ON u.point_id = p.point_id AND u.user_id = $2
       WHERE p.lesson_id = $1 AND COALESCE(u.status,'bloqueado') <> 'compreendido' LIMIT 1`,
      [l.lesson_id, req.userId]
    );
    if (pend.rowCount) return res.status(403).json({ error: "Confirma primeiro todos os pontos da aula." });
    const pts = await query(`SELECT title, explanation_parts FROM lesson_points WHERE lesson_id = $1 ORDER BY position`, [l.lesson_id]);
    const text = await callChatModel({
      system: `Es um professor. Escreve em portugues. Devolve APENAS JSON: {"questions":["...","...","...","...","..."]}. Exactamente 5 perguntas abertas, curtas, sobre o que foi ensinado.`,
      messages: [{ role: "user", content: `Aula: ${l.title}\nPontos: ${JSON.stringify(pts.rows)}` }],
      maxTokens: 800,
      jsonMode: true,
    });
    const questions = (parseJson(text).questions || []).slice(0, 5);
    const t = await query(
      `INSERT INTO lesson_tests (user_id, lesson_id, questions) VALUES ($1,$2,$3) RETURNING test_id`,
      [req.userId, l.lesson_id, JSON.stringify(questions)]
    );
    res.status(201).json({ test_id: t.rows[0].test_id, questions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel gerar o teste. Tenta de novo." });
  }
});

// Entregar o teste
router.post("/lessons/:lessonId/test/submit", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const t = await query(
      `SELECT * FROM lesson_tests WHERE test_id = $1 AND user_id = $2 AND lesson_id = $3`,
      [req.body.test_id, req.userId, req.params.lessonId]
    );
    if (!t.rowCount) return res.status(404).json({ error: "Teste nao encontrado." });
    const answers = Array.isArray(req.body.answers) ? req.body.answers.map((a) => String(a).slice(0, 500)) : [];
    const text = await callChatModel({
      system: `Es um professor justo. Escreve em portugues. Devolve APENAS JSON: {"score":0-10,"weak_points":["..."],"feedback":"..."}. Corrige as respostas abertas com tolerancia: conta o que esta substancialmente certo.`,
      messages: [{ role: "user", content: `Perguntas: ${JSON.stringify(t.rows[0].questions)}\nRespostas do aluno: ${JSON.stringify(answers)}` }],
      maxTokens: 800,
      jsonMode: true,
    });
    const ev = parseJson(text);
    await query(
      `UPDATE lesson_tests SET answers = $2, score = $3, weak_points = $4 WHERE test_id = $1`,
      [t.rows[0].test_id, JSON.stringify(answers), Number(ev.score) || 0, JSON.stringify(ev.weak_points || [])]
    );
    res.json({ score: Number(ev.score) || 0, weak_points: ev.weak_points || [], feedback: ev.feedback || "" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel corrigir o teste. Tenta de novo." });
  }
});

// TPC
router.post("/lessons/:lessonId/homework", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const work = String(req.body.text || "").trim().slice(0, 2000);
    if (work.length < 10) return res.status(400).json({ error: "Escreve o teu TPC." });
    const l = await lessonOwned(req.params.lessonId, req.userId);
    if (!l) return res.status(404).json({ error: "Aula nao encontrada." });
    const feedback = await callChatModel({
      system: "Es um professor. Em portugues, da feedback curto e construtivo ao trabalho do aluno: o que esta bom, o que melhorar, um proximo passo.",
      messages: [{ role: "user", content: `Aula: ${l.title}\nTrabalho do aluno: ${work}` }],
      maxTokens: 600,
    });
    const last = await query(
      `SELECT test_id FROM lesson_tests WHERE user_id = $1 AND lesson_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [req.userId, l.lesson_id]
    );
    if (last.rowCount) {
      await query(`UPDATE lesson_tests SET homework_feedback = $2 WHERE test_id = $1`, [last.rows[0].test_id, feedback]);
    } else {
      await query(`INSERT INTO lesson_tests (user_id, lesson_id, homework_feedback) VALUES ($1,$2,$3)`, [req.userId, l.lesson_id, feedback]);
    }
    res.json({ feedback });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel avaliar o TPC. Tenta de novo." });
  }
});

