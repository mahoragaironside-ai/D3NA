// Pilhas de font-family seguras para web (só fontes do sistema, sem carregar nada externo).
// Independente do Estilo visual — escolha livre da pessoa, tal como as Cores.
export const FONTES = {
  sistema: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  classica: "Georgia, 'Times New Roman', serif",
  moderna: "'Trebuchet MS', 'Segoe UI', sans-serif",
  maquina: "'Courier New', Courier, monospace",
  elegante: "Garamond, 'Times New Roman', serif",
  arredondada: "Verdana, Geneva, sans-serif",
  impacto: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  tradicional: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  tecnica: "'Lucida Console', Monaco, monospace",
  suave: "Tahoma, Geneva, sans-serif",
};

export function getFontFamily(fontChoice) {
  return FONTES[fontChoice] || FONTES.sistema;
}
