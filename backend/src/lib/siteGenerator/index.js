import { gerarEstrutura1 } from "./estrutura1.js";
import { gerarEstrutura2 } from "./estrutura2.js";
import { gerarEstrutura3 } from "./estrutura3.js";
import { gerarEstrutura4 } from "./estrutura4.js";
import { gerarEstrutura5 } from "./estrutura5.js";

const GERADORES = {
  1: gerarEstrutura1,
  2: gerarEstrutura2,
  3: gerarEstrutura3,
  4: gerarEstrutura4,
  5: gerarEstrutura5,
};

export function gerarSite(dados) {
  const structureChoice = Number(dados.structure_choice) || 1;
  const gerar = GERADORES[structureChoice] || gerarEstrutura1;
  return gerar(dados);
}
