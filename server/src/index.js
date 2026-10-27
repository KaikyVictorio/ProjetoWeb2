import express from "express";
import cors from "cors";
import "./db.js";
import { popularSeVazio } from "./seed.js";
import authRouter from "./routes/auth.js";
import usuariosRouter from "./routes/usuarios.js";
import obrasRouter from "./routes/obras.js";
import logsRouter from "./routes/logs.js";
import listasRouter from "./routes/listas.js";
import meRouter from "./routes/me.js";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/obras", obrasRouter);
app.use("/api/logs", logsRouter);
app.use("/api/listas", listasRouter);
app.use("/api/me", meRouter);

app.use("/api", (_req, res) => res.status(404).json({ mensagem: "Rota não encontrada." }));

// Handler global: todo erro vira { mensagem } (o front mostra esse texto)
app.use((erro, _req, res, _next) => {
  if (erro.type === "entity.parse.failed") return res.status(400).json({ mensagem: "JSON inválido." });
  if (erro.status) return res.status(erro.status).json({ mensagem: erro.message });
  console.error(erro);
  res.status(500).json({ mensagem: "Erro interno do servidor." });
});

if (process.env.SEED !== "false") popularSeVazio();

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => console.log(`Server rodando na porta ${PORT}`));
}
