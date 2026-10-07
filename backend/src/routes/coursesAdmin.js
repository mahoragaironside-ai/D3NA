import { Router } from "express";
import { query } from "../db.js";
import { requireAdminKey } from "../middleware/auth.js";

const router = Router();

// Resumo geral do modulo do Curso — totais e lista recente, para o painel administrativo.
router.get("/summary", requireAdminKey, async (req, res) => {
  const [cursos, alunos, aulas, testes, recentes] = await Promise.all([
    query("SELECT COUNT(*) AS c FROM user_courses"),
    query("SELECT COUNT(DISTINCT user_id) AS c FROM user_courses"),
    query("SELECT COUNT(*) AS c FROM course_lessons WHERE content_status != 'pendente'"),
    query("SELECT COUNT(*) AS c, COALESCE(AVG(score), 0) AS media FROM lesson_tests"),
    query(
      `SELECT uc.course_id, uc.topic, uc.level, uc.status, uc.created_at, u.phone_number,
              (SELECT COUNT(*) FROM course_lessons cl WHERE cl.course_id = uc.course_id) AS total_aulas
       FROM user_courses uc JOIN users u ON u.user_id = uc.user_id
       ORDER BY uc.created_at DESC LIMIT 15`
    ),
  ]);

  res.json({
    total_cursos: parseInt(cursos.rows[0].c, 10),
    total_alunos: parseInt(alunos.rows[0].c, 10),
    total_aulas_geradas: parseInt(aulas.rows[0].c, 10),
    total_testes: parseInt(testes.rows[0].c, 10),
    nota_media: parseFloat(testes.rows[0].media).toFixed(1),
    recentes: recentes.rows,
  });
});

// Vídeos em cache (video_cache) — moderacao: ver o que a IA escolheu automaticamente.
router.get("/videos", requireAdminKey, async (req, res) => {
  const result = await query(
    "SELECT topic_key, video_id, title, minutes, has_captions, created_at FROM video_cache ORDER BY created_at DESC LIMIT 100"
  );
  res.json(result.rows);
});

// Remove um video do cache (forca nova pesquisa na proxima vez que alguem pedir esse tema).
router.post("/videos/:topicKey/remove", requireAdminKey, async (req, res) => {
  await query("DELETE FROM video_cache WHERE topic_key = $1", [req.params.topicKey]);
  res.json({ status: "removido" });
});

export default router;
