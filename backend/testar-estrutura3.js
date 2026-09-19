import { gerarEstrutura3 } from "./src/lib/siteGenerator/estrutura3.js";
import { writeFileSync } from "fs";

const dados = {
  company_name: "Padaria Bom Sabor",
  company_description: "Pão fresco todos os dias, bolos por encomenda e entrega ao domicílio em Luanda.",
  business_type: "Pastelaria",
  color_scheme: "verde",
  style_choice: 3,
  logo_choice: 4,
  contact_links: [
    { platform: "whatsapp", label: "923 456 789", link: "https://wa.me/244923456789" },
  ],
  catalog_items: [
    { name: "Pão francês (unidade)", price: "50", description: "Fresquinho, assado todas as manhãs" },
    { name: "Bolo de aniversário (médio)", price: "8000", description: "Personalizado, encomenda com 2 dias de antecedência" },
    { name: "Caixa de 6 croissants", price: "1800", description: "" },
  ],
};

writeFileSync("teste-estrutura3.html", gerarEstrutura3(dados), "utf8");
console.log("Ficheiro gerado: teste-estrutura3.html");
