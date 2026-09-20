// Mesma tabela de cores do wizard (frontend/src/pages/SiteBuilder.jsx),
// espelhada aqui porque o backend precisa dos valores hex, não só do id.
export const CORES = {
  azul: { primary: "#16305C", secondary: "#FFFFFF" },
  verde: { primary: "#1E7A52", secondary: "#F5F6F8" },
  grafite: { primary: "#15181F", secondary: "#E0AA4E" },
  vinho: { primary: "#7A1E2E", secondary: "#FFFFFF" },
  terracota: { primary: "#B24C2B", secondary: "#FFF6EF" },
  roxo: { primary: "#4B2E83", secondary: "#F5F0FA" },
  petroleo: { primary: "#0D3B3E", secondary: "#E7F4F3" },
  mostarda: { primary: "#8A6A14", secondary: "#FFFBF0" },
  coral: { primary: "#C94A38", secondary: "#FFF8F6" },
  preto: { primary: "#0A0A0A", secondary: "#FFFFFF" },
};

export function getColors(colorScheme) {
  return CORES[colorScheme] || CORES.azul;
}
