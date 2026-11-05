import jwt from "jsonwebtoken";
import { ErroHttp } from "./util.js";

// Mesmo segredo do monólito: ele emite o token, este serviço só confere a assinatura.
// (o padrão abaixo é o mesmo do server, para funcionar em desenvolvimento sem .env)
const SEGREDO = process.env.JWT_SECRET || "segredo-de-desenvolvimento";
const TOKEN_INTERNO = process.env.INTERNAL_TOKEN || "token-interno-dev";

function idDoToken(req) {
  const cabecalho = req.headers.authorization || "";
  if (!cabecalho.startsWith("Bearer ")) return null;
  try {
    const { sub } = jwt.verify(cabecalho.slice(7), SEGREDO);
    return Number.isInteger(Number(sub)) ? Number(sub) : null;
  } catch {
    return null;
  }
}

export function exigirLogin(req, _res, next) {
  const id = idDoToken(req);
  if (!id) throw new ErroHttp(401, "Faça login para continuar.");
  req.usuarioId = id;
  next();
}

export function loginOpcional(req, _res, next) {
  req.usuarioId = idDoToken(req);
  next();
}

// Rotas /interno só aceitam chamadas de outros serviços
export function somenteInterno(req, _res, next) {
  if (req.headers["x-token-interno"] !== TOKEN_INTERNO) {
    throw new ErroHttp(401, "Acesso interno negado.");
  }
  next();
}
