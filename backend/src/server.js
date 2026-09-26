import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
console.log("=== DEBUG TAVILY_API_KEY presente:", !!process.env.TAVILY_API_KEY, "==="); // corrige "fetch failed" em redes móveis com IPv6 instável
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import messageRoutes from "./routes/messages.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import audioRoutes from "./routes/audio.js";
import supplierRoutes from "./routes/suppliers.js";
import adRoutes from "./routes/ads.js";
import siteBuilderRoutes from "./routes/siteBuilder.js";
import activityLogRoutes from "./routes/activityLog.js";
import reviewRoutes from "./routes/reviews.js";
import courseEnrollmentRoutes from "./routes/courseEnrollments.js";
import adminStatsRoutes from "./routes/adminStats.js";

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
app.use("/site-builds", siteBuilderRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/activity-log", activityLogRoutes);
app.use("/reviews", reviewRoutes);
app.use("/course-enrollments", courseEnrollmentRoutes);
app.use("/admin-stats", adminStatsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Consultor Digital backend a correr na porta ${port}`));
