import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

const CATALOGO_URL = process.env.CATALOGO_URL || "http://localhost:4001";
const LEGADO_URL = process.env.LEGADO_URL || "http://localhost:3001";

// Não usar express.json() aqui.

app.get("/health", (_req, res) => {
  res.json({ servico: "gateway", status: "ok" });
});

// /api/catalogo/* -> serviço de catálogo
app.use(
  createProxyMiddleware({
    target: CATALOGO_URL,
    changeOrigin: true,
    pathFilter: "/api/catalogo",
    pathRewrite: { "^/api/catalogo": "" },
  })
);

// o resto de /api/* -> server legado
app.use(
  createProxyMiddleware({
    target: LEGADO_URL,
    changeOrigin: true,
    pathFilter: "/api",
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[gateway] rodando na porta ${PORT}`);
});