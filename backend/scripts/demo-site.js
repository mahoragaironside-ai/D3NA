import { writeFileSync } from "fs";
import { gerarEstrutura1 } from "../src/lib/siteGenerator/estrutura1.js";

const html = gerarEstrutura1({
  company_name: "Padaria Bom Sabor",
  company_description: "Pão fresco todos os dias, bolos por encomenda e entrega ao domicílio em Luanda.",
  contact_info: "923 456 789",
  business_type: "Pastelaria",
  color_scheme: "verde",
  style_choice: 3,
});

writeFileSync("demo.html", html);
console.log("demo.html (Estilo 3 - Moderno) criado com sucesso.");
