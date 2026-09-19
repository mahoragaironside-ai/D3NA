import { getColors } from "../colors.js";
import { estilo1 } from "./estilo1.js";
import { estilo2 } from "./estilo2.js";
import { estilo3 } from "./estrutura1.js";
import { estilo4 } from "./estilo4.js";
import { estilo5 } from "./estilo5.js";
import { secaoGaleria, secaoTestemunhos } from "./secoes.js";

export function gerarEstrutura4(dados) {
  const {
    company_name = "O Meu Negócio", company_description = "",
    business_type = "", color_scheme = "azul", style_choice = 1,
    logo_choice = 1, contact_links = [], gallery_items = [],
  } = dados;

  const { primary, secondary } = getColors(color_scheme);
  const iniciais = company_name.slice(0, 2).toUpperCase();
  const d = { company_name, company_description, business_type, contact_links, logo_choice };

  const corpo = secaoGaleria(gallery_items) + secaoTestemunhos();

  const geradores = { 1: estilo1, 2: estilo2, 3: estilo3, 4: estilo4, 5: estilo5 };
  const gerar = geradores[style_choice] || estilo3;

  return gerar(d, primary, secondary, iniciais, corpo);
}
