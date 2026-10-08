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
  rosa: { primary: "#C2185B", secondary: "#FFF0F5" },
  turquesa: { primary: "#0E8388", secondary: "#EAFBFB" },
  esmeralda: { primary: "#065F46", secondary: "#ECFDF5" },
  ameixa: { primary: "#6B2D5C", secondary: "#FBF0F8" },
  marinho: { primary: "#0B1F3A", secondary: "#F4F1E8" },
  oliva: { primary: "#556B2F", secondary: "#FAFBF0" },
  ardosia: { primary: "#334155", secondary: "#F1F5F9" },
  pessego: { primary: "#C96A4D", secondary: "#FFF3EC" },
  bordo: { primary: "#5C0A1E", secondary: "#FBEFF1" },
  menta: { primary: "#0F766E", secondary: "#ECFFFC" },
  chumboneon: { primary: "#121212", secondary: "#39FF88" },
  areia: { primary: "#8A7158", secondary: "#FBF8F3" },
  ceu: { primary: "#1C6DD0", secondary: "#EAF4FF" },
  carmesim: { primary: "#B0102A", secondary: "#FFF1F2" },
  safira: { primary: "#0B3D91", secondary: "#EAF0FF" },
  cobre: { primary: "#9C4A1A", secondary: "#FFF4EC" },
  chumbo: { primary: "#2B2B2B", secondary: "#FFFFFF" },
  lavanda: { primary: "#7C6FAE", secondary: "#F6F3FC" },
  floresta: { primary: "#14432A", secondary: "#F1F8F3" },
  pretodourado: { primary: "#000000", secondary: "#D4AF37" },
};

export function getColors(colorScheme) {
  return CORES[colorScheme] || CORES.azul;
}
