import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server rodando na porta ${PORT}`);
});