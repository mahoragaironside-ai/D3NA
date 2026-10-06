const fs = require("fs");
const f = "src/server.js";
let s = fs.readFileSync(f, "utf8");
if (s.includes("routes/courses.js")) { console.log("Ja registado."); process.exit(0); }
const imp = 'import affiliateRoutes from "./routes/affiliates.js";';
const use = 'app.use("/affiliates", affiliateRoutes);';
if (!s.includes(imp) || !s.includes(use)) { console.error("Linhas de referencia nao encontradas."); process.exit(1); }
s = s.replace(imp, imp + '\nimport courseRoutes from "./routes/courses.js";');
s = s.replace(use, use + '\napp.use("/courses", courseRoutes);');
fs.writeFileSync(f, s);
console.log("Rota /courses registada.");
