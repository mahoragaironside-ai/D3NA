import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_TTL_MINUTES = 10;

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999)); // código de 6 dígitos
}

export async function sendOtpSms(phoneNumber, code) {
  if (!process.env.HTTPSMS_API_KEY || !process.env.HTTPSMS_FROM_NUMBER) {
    throw new Error("httpSMS não configurado (HTTPSMS_API_KEY / HTTPSMS_FROM_NUMBER em falta).");
  }
  const response = await fetch("https://api.httpsms.com/v1/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.HTTPSMS_API_KEY },
    body: JSON.stringify({
      content: `O teu código de verificação do Consultor Digital é: ${code}. Válido por ${OTP_TTL_MINUTES} minutos.`,
      from: process.env.HTTPSMS_FROM_NUMBER,
      to: phoneNumber,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao enviar SMS via httpSMS: ${response.status} ${errText}`);
  }
}

export async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code, hash) {
  if (!hash) return false;
  return bcrypt.compare(code, hash);
}

export function otpExpiry() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}
