import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { callChatModel as rawChat } from "../ai/orchestrator.js";

async function callChatModel(opts) {
  const t = await rawChat(opts);
  return typeof t === "string" ? t.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "") : t;
}

const router = Router();
const generating = new Set();

function parseJson(text) {
  return JSON.parse(String(text).replace(/```json|```/g, "").trim());
}

function isoToMinutes(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return null;
  return Math.round(((+m[1] || 0) * 60 + (+m[2] || 0) + (+m[3] || 0) / 60) * 10) / 10;
}

async function requireEnrollment(req, res, next) {
  try {
    const r = await query(
      `SELECT 1 FROM course_enrollments
       WHERE user_id = $1 AND payment_status = 'confirmado' AND expires_at > now() LIMIT 1`,
      [req.userId]
    );
    req.enrolled = r.rowCount > 0;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

const isFree = (x) => Number(x.module_number) === 1 && Number(x.lesson_number) === 1;
const LOCKED = "Esta aula faz parte da inscricao semanal.";

async function getTranscript(videoId) {
  try {
    const mod = await import("youtube-transcript");
    const YT = mod.YoutubeTranscript || (mod.default && mod.default.YoutubeTranscript);
    if (!YT) return null;
    let items;
    try { items = await YT.fetchTranscript(videoId, { lang: "pt" }); }
    catch (e) { items = await YT.fetchTranscript(videoId); }
    const text = (items || []).map((i) => String(i.text || "")).join(" ").replace(/\s+/g, " ").trim();
    return text.length > 300 ? text : null;
  } catch (e) {
    console.error("Transcricao:", e.message);
    return null;
  }
}

async function findVideo(topicKey, searchText) {
  const cached = await query("SELECT * FROM video_cache WHERE topic_key = $1", [topicKey]);
  if (cached.rowCount) {
    const c = cached.rows[0];
    if (!c.transcript) {
      const t = await getTranscript(c.video_id);
      if (t) {
        await query("UPDATE video_cache SET transcript = $2, has_captions = true WHERE topic_key = $1", [topicKey, t]);
        c.transcript = t;
      }
    }
    return c;
  }
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const sp = new URLSearchParams({ part: "snippet", q: searchText, type: "video", videoDuration: "medium", videoEmbeddable: "true", relevanceLanguage: "pt", maxResults: "5", key });
    const sj = await (await fetch("https://www.googleapis.com/youtube/v3/search?" + sp)).json();
    const ids = (sj.items || []).map((i) => i.id && i.id.videoId).filter(Boolean);
    if (!ids.length) return null;
    const vp = new URLSearchParams({ part: "contentDetails,snippet", id: ids.join(","), key });
    const vj = await (await fetch("https://www.googleapis.com/youtube/v3/videos?" + vp)).json();
    const cands = vj.items || [];
    if (!cands.length) return null;
    let pick = null;
    let text = null;
    for (const v of cands) {
      const t = await getTranscript(v.id);
      if (t) { pick = v; text = t; break; }
    }
    if (!pick) pick = cands[0];
    const row = { topic_key: topicKey, video_id: pick.id, title: pick.snippet.title, minutes: isoToMinutes(pick.contentDetails.duration), transcript: text, has_captions: !!text };
    await query("INSERT INTO video_cache (topic_key, video_id, title, minutes, has_captions, transcript) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (topic_key) DO NOTHING", [row.topic_key, row.video_id, row.title, row.minutes, row.has_captions, row.transcript]);
    return row;
  } catch (e) {
    console.error("YouTube:", e.message);
    return null;
  }
}

const PLAN_SYSTEM = `Es um professor experiente. Escreve em portugues. Devolve APENAS JSON:
{"level":"iniciante|intermedio|avancado","modules":[{"title":"...","lessons":[{"title":"...","summary":"..."}]}]}
Maximo 3 modulos e 3 aulas por modulo, ordenados do basico ao avancado, adequados ao pedido do aluno.`;

const POINTS_SYSTEM = `Es um professor claro e paciente. Escreve em portugues. Devolve APENAS JSON:
{"points":[{"kind":"video|extra","title":"...","explanation_parts":["...","...","..."],"check_question":"..."}]}
Exactamente 4 pontos. Cada explicacao tem 3 partes curtas (2 a 3 frases cada), com exemplos simples.
A check_question pede ao aluno que explique o ponto com as proprias palavras.
Se receberes a TRANSCRICAO DO VIDEO: pelo menos 2 pontos devem ter kind "video" e explicar o que o video realmente disse, sem inventar nada que la nao esteja. Os restantes podem ter kind "extra": conceitos essenciais que o video NAO disse mas que o aluno precisa de saber, so se tiveres certeza de que estao correctos. Se nao tiveres certeza, faz mais pontos "video".
Se NAO receberes transcricao, explica o tema da aula normalmente.
So afirma o que tens certeza.`;

async function generateLesson(lesson, userId) {
  const topicKey = `${lesson.topic} ${lesson.title}`.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 150);
  const video = await findVideo(topicKey, `${lesson.title} ${lesson.topic} tutorial`);
  const text = await callChatModel({
    system: POINTS_SYSTEM,
    messages: [{
      role: "user",
      content: `Curso: ${lesson.topic}\nNivel: ${lesson.level}\nAula: ${lesson.title}\nResumo: ${lesson.summary}` +
        (video ? `\nVideo da aula (titulo): ${video.title}` : "") + (video && video.transcript ? `\n\nTRANSCRICAO DO VIDEO:\n${String(video.transcript).slice(0, 14000)}` : ""),
    }],
    maxTokens: 2500,
    jsonMode: true,
  });
  const points = (parseJson(text).points || []).slice(0, 4);
  if (!points.length) throw new Error("sem pontos");
  await query(`DELETE FROM lesson_points WHERE lesson_id = $1`, [lesson.lesson_id]);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const ins = await query(
      `INSERT INTO lesson_points (lesson_id, position, kind, title, explanation_parts, check_question)
       VALUES ($1,$2,$6,$3,$4,$5) RETURNING point_id`,
      [lesson.lesson_id, i + 1, p.title, JSON.stringify(p.explanation_parts || []), p.check_question, video && video.transcript ? (p.kind === "extra" ? "extra" : "video") : "texto"]
    );
    await query(
      `INSERT INTO user_point_progress (user_id, point_id, status) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, point_id) DO NOTHING`,
      [userId, ins.rows[0].point_id, i === 0 ? "em_andamento" : "bloqueado"]
    );
  }
  await query(
    `UPDATE course_lessons SET video_id=$2, video_minutes=$3, extra_minutes=$4, content_status='pronta'
     WHERE lesson_id=$1`,
    [lesson.lesson_id, video ? video.video_id : null, video ? video.minutes : null, Math.round(points.length * 1.5)]
  );
}

// Pedir um novo curso
router.post("/", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const topic = String(req.body.topic || "").trim().slice(0, 200);
    if (topic.length < 3) return res.status(400).json({ error: "Diz o que queres aprender." });
    if (!req.enrolled) {
      const n = await query("SELECT count(*)::int AS n FROM user_courses WHERE user_id = $1", [req.userId]);
      if (n.rows[0].n >= 1) return res.status(403).json({ error: "A tua aula gratuita ja foi usada. Faz a inscricao para criar mais cursos." });
    }
    const text = await callChatModel({
      system: PLAN_SYSTEM,
      messages: [{ role: "user", content: `Tema pedido pelo aluno: ${topic}` }],
      maxTokens: 1500,
      jsonMode: true,
    });
    const plan = parseJson(text);
    const modules = (plan.modules || []).slice(0, 3);
    if (!modules.length) throw new Error("plano vazio");
    const c = await query(
      `INSERT INTO user_courses (user_id, topic, level, plan) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.userId, topic, plan.level || "iniciante", JSON.stringify(plan)]
    );
    const course = c.rows[0];
    for (let mi = 0; mi < modules.length; mi++) {
      const lessons = (modules[mi].lessons || []).slice(0, 3);
      for (let li = 0; li < lessons.length; li++) {
        await query(
          `INSERT INTO course_lessons (course_id, module_number, lesson_number, title, summary)
           VALUES ($1,$2,$3,$4,$5)`,
          [course.course_id, mi + 1, li + 1, lessons[li].title, lessons[li].summary]
        );
      }
    }
    try {
      const f1 = await query("SELECT l.*, c.topic, c.level FROM course_lessons l JOIN user_courses c ON c.course_id = l.course_id WHERE l.course_id = $1 AND l.module_number = 1 AND l.lesson_number = 1", [course.course_id]);
      if (f1.rowCount) {
        const fid = f1.rows[0].lesson_id;
        generating.add(fid);
        generateLesson(f1.rows[0], req.userId).catch((e) => console.error("pre-geracao:", e.message)).finally(() => generating.delete(fid));
      }
    } catch (e) { console.error(e); }
    res.status(201).json({ course });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel criar o curso. Tenta de novo." });
  }
});

// Listar os meus cursos
router.get("/", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const r = await query(
      `SELECT course_id, topic, level, status, created_at FROM user_courses
       WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json({ courses: r.rows, enrolled: !!req.enrolled });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Abrir uma aula (gera o conteudo na primeira vez)
router.get("/lessons/:lessonId", requireAuth, requireEnrollment, async (req, res) => {
  const id = req.params.lessonId;
  try {
    const q = () => query(
      `SELECT l.*, c.topic, c.level FROM course_lessons l
       JOIN user_courses c ON c.course_id = l.course_id
       WHERE l.lesson_id = $1 AND c.user_id = $2`,
      [id, req.userId]
    );
    let r = await q();
    if (!r.rowCount) return res.status(404).json({ error: "Aula nao encontrada." });
    if (!req.enrolled && !isFree(r.rows[0])) return res.status(403).json({ error: LOCKED });
    if (r.rows[0].content_status !== "pronta") {
      if (generating.has(id)) return res.status(202).json({ status: "a_gerar" });
      generating.add(id);
      try {
        await generateLesson(r.rows[0], req.userId);
      } finally {
        generating.delete(id);
      }
      r = await q();
    }
    const lesson = r.rows[0];
    const pts = await query(
      `SELECT p.point_id, p.position, p.kind, p.title, p.explanation_parts, p.check_question,
              COALESCE(u.status, 'bloqueado') AS status
       FROM lesson_points p
       LEFT JOIN user_point_progress u ON u.point_id = p.point_id AND u.user_id = $2
       WHERE p.lesson_id = $1 ORDER BY p.position`,
      [id, req.userId]
    );
    const points = pts.rows.map((p) =>
      p.status === "bloqueado"
        ? { point_id: p.point_id, position: p.position, title: p.title, kind: p.kind, status: p.status }
        : p
    );
    res.json({
      lesson: {
        lesson_id: lesson.lesson_id, title: lesson.title, summary: lesson.summary,
        module_number: lesson.module_number, lesson_number: lesson.lesson_number,
        video_minutes: lesson.video_minutes, extra_minutes: lesson.extra_minutes,
      },
      video: lesson.video_id
        ? { video_id: lesson.video_id, embed_url: `https://www.youtube.com/embed/${lesson.video_id}` }
        : null,
      points,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Nao foi possivel abrir a aula. Tenta de novo." });
  }
});

// Ver um curso e as suas aulas
router.get("/:courseId", requireAuth, requireEnrollment, async (req, res) => {
  try {
    const c = await query(`SELECT * FROM user_courses WHERE course_id = $1 AND user_id = $2`, [
      req.params.courseId, req.userId,
    ]);
    if (!c.rowCount) return res.status(404).json({ error: "Curso nao encontrado." });
    const l = await query(
      `SELECT l.lesson_id, l.module_number, l.lesson_number, l.title, l.summary, l.content_status, (SELECT count(*) FROM lesson_points p WHERE p.lesson_id = l.lesson_id)::int AS points_total, (SELECT count(*) FROM lesson_points p JOIN user_point_progress u ON u.point_id = p.point_id AND u.user_id = $2 WHERE p.lesson_id = l.lesson_id AND u.status = 'compreendido')::int AS points_done
       FROM course_lessons l WHERE l.course_id = $1 ORDER BY l.module_number, l.lesson_number`,
      [req.params.courseId, req.userId]
    );
    res.json({ course: c.rows[0], lessons: l.rows, enrolled: !!req.enrolled });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

async function getPoint(pointId, userId) {
  const r = await query(
    `SELECT p.*, l.module_number, l.lesson_number, c.topic, c.level, COALESCE(u.status,'bloqueado') AS status
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
    if (!req.enrolled && !isFree(p)) return res.status(403).json({ error: LOCKED });
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
    if (!req.enrolled && !isFree(p)) return res.status(403).json({ error: LOCKED });
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
    if (!req.enrolled && !isFree(l)) return res.status(403).json({ error: LOCKED });
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
    if (!req.enrolled && !isFree(l)) return res.status(403).json({ error: LOCKED });
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

export default router;
