// Notificacoes por SMS reaproveitando o mesmo provedor (httpSMS) do OTP.
// Falhas aqui nunca devem impedir a confirmacao do pagamento em si —
// por isso e sempre chamado com try/catch a volta, e so regista o erro.
export async function sendNotificationSms(phoneNumber, message) {
  if (!phoneNumber) return;
  if (!process.env.HTTPSMS_API_KEY || !process.env.HTTPSMS_FROM_NUMBER) return;
  const response = await fetch("https://api.httpsms.com/v1/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.HTTPSMS_API_KEY },
    body: JSON.stringify({ content: message, from: process.env.HTTPSMS_FROM_NUMBER, to: phoneNumber }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao enviar SMS de notificacao: ${response.status} ${errText}`);
  }
}

// Extrai um numero de telefone (whatsapp ou telefone) de contact_links do Construtor.
export function extractPhoneFromContactLinks(contactLinksRaw) {
  try {
    const links = typeof contactLinksRaw === "string" ? JSON.parse(contactLinksRaw) : contactLinksRaw;
    if (!Array.isArray(links)) return null;
    const found = links.find((l) => l.platform === "whatsapp" || l.platform === "telefone");
    if (!found) return null;
    const digits = found.value.replace(/\D/g, "");
    return digits.length <= 9 ? `+244${digits}` : `+${digits}`;
  } catch {
    return null;
  }
}
