import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { ErroHttp } from "./util.js";

const SEGREDO = process.env.JWT_SECRET || "segredo-de-desenvolvimento";
if (!process.env.JWT_SECRET) {
  console.warn("[aviso] JWT_SECRET não definido: usando segredo de desenvolvimento.");
}

export function gerarHash(senha) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

export function conferirSenha(senha, armazenado) {
  const [sal, hash] = armazenado.split(":");
  const calculado = crypto.scryptSync(senha, sal, 64);
  const esperado = Buffer.from(hash, "hex");
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

export const gerarToken = (usuarioId) =>
  jwt.sign({ sub: usuarioId }, SEGREDO, { expiresIn: "7d" });

function usuarioDoToken(req) {
  const cabecalho = req.headers.authorization || "";
  if (!cabecalho.startsWith("Bearer ")) return null;
  try {
    const { sub } = jwt.verify(cabecalho.slice(7), SEGREDO);
    return db.prepare("SELECT id, nome, usuario FROM usuarios WHERE id = ?").get(sub) ?? null;
  } catch {
    return null;
  }
}

// Exige login: coloca o usuário em req.usuario
export function exigirLogin(req, _res, next) {
  const usuario = usuarioDoToken(req);
  if (!usuario) throw new ErroHttp(401, "Faça login para continuar.");
  req.usuario = usuario;
  next();
}

// Login opcional: req.usuario fica null se não houver token válido
export function loginOpcional(req, _res, next) {
  req.usuario = usuarioDoToken(req);
  next();
}
