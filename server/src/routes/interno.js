import { Router } from "express";
import { db } from "../db.js";
import { ErroHttp } from "../util.js";

// Rotas só para outros serviços. O gateway bloqueia /api/interno e aqui exigimos o token.
const router = Router();

router.use((req, _res, next) => {
  if (req.headers["x-token-interno"] !== (process.env.INTERNAL_TOKEN || "token-interno-dev")) {
    throw new ErroHttp(401, "Acesso interno negado.");
  }
  next();
});

// GET /api/interno/seguidores  (usado uma vez pelo serviço social para importar os dados antigos)
router.get("/seguidores", (_req, res) => {
  res.json(db.prepare("SELECT seguidor_id, seguido_id FROM seguidores").all());
});

// GET /api/interno/favoritos  (usado uma vez pelo serviço de favoritos para importar os dados antigos)
router.get("/favoritos", (_req, res) => {
  res.json(db.prepare("SELECT usuario_id, obra_id, criado_em FROM favoritos").all());
});

// GET /api/interno/wishlist  (usado uma vez pelo serviço de wishlist para importar os dados antigos)
router.get("/wishlist", (_req, res) => {
  res.json(db.prepare("SELECT usuario_id, obra_id, criado_em FROM wishlist").all());
});

export default router;
