import { Router } from "express";
import { db } from "../db.js";
import { conferirSenha, exigirLogin, gerarHash, gerarToken } from "../auth.js";
import { usuarioCompleto } from "../serializers.js";
import { ErroHttp, texto } from "../util.js";

const router = Router();

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PADRAO_USUARIO = /^[a-z0-9._]{3,30}$/;

// POST /api/auth/cadastro  { nome_usuario, email, senha }
router.post("/cadastro", (req, res) => {
  const nomeUsuario = texto(req.body.nome_usuario, 30).toLowerCase();
  const email = texto(req.body.email, 120).toLowerCase();
  const senha = typeof req.body.senha === "string" ? req.body.senha : "";

  if (!PADRAO_USUARIO.test(nomeUsuario)) {
    throw new ErroHttp(400, "Nome de usuário inválido: use 3 a 30 letras minúsculas, números, ponto ou underline.");
  }
  if (!PADRAO_EMAIL.test(email)) throw new ErroHttp(400, "E-mail inválido.");
  if (senha.length < 6) throw new ErroHttp(400, "A senha precisa ter pelo menos 6 caracteres.");

  if (db.prepare("SELECT 1 FROM usuarios WHERE usuario = ?").get(nomeUsuario)) {
    throw new ErroHttp(409, "Esse nome de usuário já está em uso.");
  }
  if (db.prepare("SELECT 1 FROM usuarios WHERE email = ?").get(email)) {
    throw new ErroHttp(409, "Já existe uma conta com esse e-mail.");
  }

  const { lastInsertRowid } = db
    .prepare("INSERT INTO usuarios (nome, usuario, email, senha_hash) VALUES (?, ?, ?, ?)")
    .run(nomeUsuario, nomeUsuario, email, gerarHash(senha));

  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(lastInsertRowid);
  res.status(201).json({ usuario: usuarioCompleto(usuario), token: gerarToken(usuario.id) });
});

// POST /api/auth/login  { email, senha }
router.post("/login", (req, res) => {
  const email = texto(req.body.email, 120).toLowerCase();
  const senha = typeof req.body.senha === "string" ? req.body.senha : "";

  const usuario = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
  if (!usuario || !conferirSenha(senha, usuario.senha_hash)) {
    throw new ErroHttp(401, "E-mail ou senha incorretos.");
  }
  res.json({ usuario: usuarioCompleto(usuario), token: gerarToken(usuario.id) });
});

// GET /api/auth/me
router.get("/me", exigirLogin, (req, res) => {
  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(req.usuario.id);
  res.json({ usuario: usuarioCompleto(usuario) });
});

export default router;
