// Lê as chaves de ambiente UMA ÚNICA VEZ, no momento em que este módulo é
// carregado (arranque do servidor), e exporta como constantes partilhadas
// por todo o backend. Evita reler process.env a meio de um pedido HTTP.
export const SERPER_API_KEY = process.env.SERPER_API_KEY;
export const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const DATABASE_URL = process.env.DATABASE_URL;

console.log("=== CONFIG carregada no arranque — SERPER:", !!SERPER_API_KEY, "| GROQ:", !!GROQ_API_KEY, "===");
