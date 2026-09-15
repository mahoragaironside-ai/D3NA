// Mesma tabela de cores do wizard (frontend/src/pages/SiteBuilder.jsx),
// espelhada aqui porque o backend precisa dos valores hex, não só do id.
export const CORES = {
  azul: { primary: "#16305C", secondary: "#FFFFFF" },
  verde: { primary: "#1E7A52", secondary: "#F5F6F8" },
  grafite: { primary: "#15181F", secondary: "#E0AA4E" },
  vinho: { primary: "#7A1E2E", secondary: "#FFFFFF" },
};

export function getColors(colorScheme) {
  return CORES[colorScheme] || CORES.azul;
}
