import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

const CATALOGO_URL = process.env.CATALOGO_URL || "http://localhost:4001";
const SOCIAL_URL = process.env.SOCIAL_URL || "http://localhost:4002";
const FAVORITOS_URL = process.env.FAVORITOS_URL || "http://localhost:4003";
const WISHLIST_URL = process.env.WISHLIST_URL || "http://localhost:4004";
const LEGADO_URL = process.env.LEGADO_URL || "http://localhost:3001";

// Não usar express.json() aqui.

// Serviço fora do ar: devolve { mensagem } como o resto da API (o front mostra esse texto)
const aoFalhar = {
  error(erro, _req, res) {
    console.error(`[gateway] falha ao falar com um serviço: ${erro.message}`);
    if (typeof res.writeHead !== "function" || res.headersSent) return;
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ mensagem: "Serviço temporariamente indisponível. Tente de novo em instantes." }));
  },
};

app.get("/health", (_req, res) => {
  res.json({ servico: "gateway", status: "ok" });
});

// Rotas internas (entre serviços) nunca saem pelo gateway
app.use("/api/interno", (_req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

// /api/catalogo/* -> serviço de catálogo
app.use(
  createProxyMiddleware({
    target: CATALOGO_URL,
    changeOrigin: true,
    on: aoFalhar,
    pathFilter: "/api/catalogo",
    pathRewrite: { "^/api/catalogo": "" },
  })
);

// /api/usuarios/:id/{seguir,seguidores,seguindo} -> serviço social (sem o prefixo /api)
const ROTAS_SOCIAL = /^\/api\/usuarios\/[^/]+\/(seguir|seguidores|seguindo)\/?$/;
app.use(
  createProxyMiddleware({
    target: SOCIAL_URL,
    changeOrigin: true,
    on: aoFalhar,
    pathFilter: (pathname) => ROTAS_SOCIAL.test(pathname),
    pathRewrite: { "^/api": "" },
  })
);

// /api/me/favoritos[/:obraId] e /api/usuarios/:id/favoritos -> serviço de favoritos (sem o prefixo /api)
const ROTAS_FAVORITOS = /^\/api\/(me\/favoritos(\/[^/]+)?|usuarios\/[^/]+\/favoritos)\/?$/;
app.use(
  createProxyMiddleware({
    target: FAVORITOS_URL,
    changeOrigin: true,
    on: aoFalhar,
    pathFilter: (pathname) => ROTAS_FAVORITOS.test(pathname),
    pathRewrite: { "^/api": "" },
  })
);

// /api/me/wishlist[/:obraId] e /api/usuarios/:id/wishlist -> serviço de wishlist (sem o prefixo /api)
const ROTAS_WISHLIST = /^\/api\/(me\/wishlist(\/[^/]+)?|usuarios\/[^/]+\/wishlist)\/?$/;
app.use(
  createProxyMiddleware({
    target: WISHLIST_URL,
    changeOrigin: true,
    on: aoFalhar,
    pathFilter: (pathname) => ROTAS_WISHLIST.test(pathname),
    pathRewrite: { "^/api": "" },
  })
);

// o resto de /api/* -> server legado
app.use(
  createProxyMiddleware({
    target: LEGADO_URL,
    changeOrigin: true,
    on: aoFalhar,
    pathFilter: "/api",
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[gateway] rodando na porta ${PORT}`);
});
