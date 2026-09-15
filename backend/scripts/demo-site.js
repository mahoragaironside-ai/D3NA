import { writeFileSync } from "fs";
import { gerarEstrutura1 } from "../src/lib/siteGenerator/estrutura1.js";

const html = gerarEstrutura1({
  company_name: "Padaria Bom Sabor",
  company_description: "Pão fresco todos os dias, bolos por encomenda e entrega ao domicílio em Luanda.",
  business_type: "Pastelaria",
  color_scheme: "verde",
  logo_choice: 4,
  contact_links: [
    { platform: "whatsapp", label: "923 456 789", link: "https://wa.me/244923456789" },
    { platform: "instagram", label: "padariabomsabor", link: "https://instagram.com/padariabomsabor" },
    { platform: "telefone", label: "923 456 789", link: "tel:923456789" },
  ],
});

writeFileSync("demo.html", html);
console.log("demo.html (logo + multi-contacto) criado com sucesso.");
