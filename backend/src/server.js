import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import messageRoutes from "./routes/messages.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import audioRoutes from "./routes/audio.js";
import supplierRoutes from "./routes/suppliers.js";
import adRoutes from "./routes/ads.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/projects", messageRoutes); // adiciona POST /projects/:projectId/messages
app.use("/projects", audioRoutes);   // adiciona POST /projects/:projectId/audio
app.use("/projects", supplierRoutes); // adiciona POST /projects/:projectId/suppliers
app.use("/ads", adRoutes);
app.use("/subscriptions", subscriptionRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Consultor Digital backend a correr na porta ${port}`));
