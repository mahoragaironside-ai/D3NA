// Transcrição de áudio via Groq (Whisper alojado pela Groq — grátis, mesma chave da conversa).

export async function transcribeAudio(buffer, mimetype) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada — a transcrição de áudio não está disponível.");
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimetype || "audio/webm" });
  form.append("file", blob, "audio.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", process.env.STT_LANGUAGE || "pt");
  form.append("response_format", "verbose_json");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro no serviço de transcrição: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const transcript = (data.text || "").trim();
  const confidence = estimateConfidence(data.segments);
  const threshold = Number(process.env.STT_CONFIDENCE_THRESHOLD || 0.55);

  return {
    transcript,
    confidence,
    low_confidence: transcript.length === 0 || confidence < threshold,
  };
}

function estimateConfidence(segments) {
  if (!segments || segments.length === 0) return 0;
  let total = 0;
  for (const seg of segments) {
    const noSpeech = seg.no_speech_prob ?? 0.5;
    const logProb = seg.avg_logprob ?? -1;
    const logProbScore = Math.max(0, Math.min(1, 1 + logProb));
    const segmentScore = (1 - noSpeech) * 0.5 + logProbScore * 0.5;
    total += segmentScore;
  }
  return total / segments.length;
}
