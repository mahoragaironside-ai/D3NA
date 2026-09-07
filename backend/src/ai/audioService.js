// Serviço de transcrição — a única peça do sistema que fala com um provedor de STT.
// Devolve o texto transcrito e um nível de confiança estimado. Nunca inventa texto:
// se a confiança ficar abaixo do limiar, o chamador deve pedir confirmação ao utilizador
// em vez de tratar a transcrição como certa (ver secção 12 do prompt mestre original / secção 10 do doc de arquitetura).

export async function transcribeAudio(buffer, mimetype) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada — a transcrição de áudio não está disponível.");
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimetype || "audio/webm" });
  form.append("file", blob, "audio.webm");
  form.append("model", "whisper-1");
  form.append("language", process.env.STT_LANGUAGE || "pt");
  form.append("response_format", "verbose_json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
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

// O Whisper não devolve uma "confiança" direta. Aproximamo-la a partir de
// no_speech_prob (probabilidade de não haver fala) e avg_logprob (log-probabilidade média
// dos tokens) de cada segmento — quanto mais perto de 1, mais confiante.
function estimateConfidence(segments) {
  if (!segments || segments.length === 0) return 0;
  let total = 0;
  for (const seg of segments) {
    const noSpeech = seg.no_speech_prob ?? 0.5;
    const logProb = seg.avg_logprob ?? -1;
    // normaliza avg_logprob (tipicamente entre -0.2 e -2) para 0..1
    const logProbScore = Math.max(0, Math.min(1, 1 + logProb));
    const segmentScore = (1 - noSpeech) * 0.5 + logProbScore * 0.5;
    total += segmentScore;
  }
  return total / segments.length;
}
