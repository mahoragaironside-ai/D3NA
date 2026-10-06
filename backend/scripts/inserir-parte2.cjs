const fs = require("fs");
const f = "src/routes/courses.js";
let s = fs.readFileSync(f, "utf8");
if (s.includes("/points/:pointId/answer")) { console.log("Ja inserido."); process.exit(0); }
const frag = fs.readFileSync("scripts/courses-parte2.frag", "utf8");
if (!s.includes("export default router;")) { console.error("export nao encontrado."); process.exit(1); }
s = s.replace("export default router;", frag + "export default router;");
fs.writeFileSync(f, s);
console.log("Parte 2 inserida.");
