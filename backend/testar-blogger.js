import { bloggerEstilo1 } from "./src/lib/siteGenerator/bloggerEstilo1.js";
import { writeFileSync } from "fs";

const dados = {
  company_name: "Padaria Bom Sabor",
  company_description: "Pão fresco todos os dias, bolos por encomenda e entrega ao domicílio em Luanda.",
  business_type: "Padaria",
  color_scheme: "verde",
  contact_links: [
    { platform: "whatsapp", label: "WhatsApp", link: "https://wa.me/244900000000" },
    { platform: "instagram", label: "Instagram", link: "https://instagram.com/padariabomsabor" },
  ],
};

const xml = bloggerEstilo1(dados);
writeFileSync("teste-blogger.xml", xml, "utf8");
console.log("Ficheiro gerado: teste-blogger.xml");
