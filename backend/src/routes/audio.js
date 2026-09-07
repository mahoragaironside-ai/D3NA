import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { transcribeAudio } from "../ai/audioService.js";
import { query } from "../db.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const router = Router();
router.use(requireAuth);

// GRAVAR (frontend) → ENVIAR (este endpoint) → TRANSCREVER → devolve texto + confiança.
// Não envia a mensagem sozinho: o frontend decide se envia automaticamente (confiança alta)
// ou se pede confirmação ao utilizador antes de enviar (confiança baixa).
router.post("/:projectId/audio", upload.single("audio"), async (req, res) => {
  const project = await query("SELECT project_id FROM projects WHERE project_id = $1 AND user_id = $2", [req.params.projectId, req.userId]);
  if (project.rows.length === 0) return res.status(404).json({ error: "Projeto não encontrado." });

  if (!req.file) return res.status(400).json({ error: "Nenhum áudio recebido." });

  try {
    const result = await transcribeAudio(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

export default router;
