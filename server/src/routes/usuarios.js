import { Router } from "express";
import { db } from "../db.js";
import { exigirLogin, loginOpcional } from "../auth.js";
import { logJson, obraResumo, SELECT_LOG, usuarioBasico, usuarioCompleto } from "../serializers.js";
import { favoritos, wishlist, wishlistRecentes } from "../colecoes.js";
import { contagens, removerUsuario } from "../social.js";
import { ErroHttp, idParam, like, paginacao, texto } from "../util.js";

const router = Router();

const ACAO_POR_CATEGORIA = { livro: "lendo", jogo: "jogando", serie: "assistindo" };

function usuarioOuErro(id) {
  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);
  if (!usuario) throw new ErroHttp(404, "Usuário não encontrado.");
  return usuario;
}

// GET /api/usuarios?q=&limite=   |   GET /api/usuarios?ids=1,2,3  (usado pelo serviço social)
router.get("/", (req, res) => {
  const { limite, offset } = paginacao(req.query, 50, 200);
  const q = texto(req.query.q, 60);

  if (typeof req.query.ids === "string") {
    const ids = [...new Set(req.query.ids.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 200);
    if (ids.length === 0) return res.json([]);
    const linhas = db
      .prepare(`SELECT * FROM usuarios WHERE id IN (${ids.map(() => "?").join(",")})`)
      .all(...ids);
    return res.json(linhas.map(usuarioBasico));
  }

  const linhas = q
    ? db
        .prepare(
          `SELECT * FROM usuarios WHERE nome LIKE ? ESCAPE '\\' OR usuario LIKE ? ESCAPE '\\'
           ORDER BY nome COLLATE NOCASE LIMIT ? OFFSET ?`
        )
        .all(like(q), like(q), limite, offset)
    : db.prepare("SELECT * FROM usuarios ORDER BY nome COLLATE NOCASE LIMIT ? OFFSET ?").all(limite, offset);
  res.json(linhas.map(usuarioBasico));
});

// PUT /api/usuarios/me  { nome, bio, foto, infos:[{rotulo,valor}] }
router.put("/me", exigirLogin, (req, res) => {
  const nome = texto(req.body.nome, 60);
  if (!nome) throw new ErroHttp(400, "Informe seu nome.");

  const infos = Array.isArray(req.body.infos)
    ? req.body.infos
        .map((i) => ({ rotulo: texto(i?.rotulo, 30), valor: texto(i?.valor, 60) }))
        .filter((i) => i.rotulo && i.valor)
        .slice(0, 8)
    : [];

  db.prepare("UPDATE usuarios SET nome = ?, bio = ?, foto = ?, infos = ? WHERE id = ?").run(
    nome,
    texto(req.body.bio, 300),
    texto(req.body.foto, 500),
    JSON.stringify(infos),
    req.usuario.id
  );
  res.json({ usuario: usuarioCompleto(usuarioOuErro(req.usuario.id)) });
});

// DELETE /api/usuarios/me  (apaga a conta e tudo que é dela)
router.delete("/me", exigirLogin, (req, res) => {
  db.prepare("DELETE FROM usuarios WHERE id = ?").run(req.usuario.id);
  removerUsuario(req.usuario.id);
  favoritos.removerUsuario(req.usuario.id);
  wishlist.removerUsuario(req.usuario.id);
  res.status(204).end();
});

// GET /api/usuarios/:id  (perfil público; seguidores/seguindo/euSigo vêm do serviço social)
router.get("/:id", loginOpcional, async (req, res) => {
  const usuario = usuarioOuErro(idParam(req.params.id));
  const { seguidores, seguindo, euSigo } = await contagens(usuario.id, req.usuario?.id);

  const { email, ...publico } = usuarioCompleto(usuario);
  res.json({ ...publico, seguidores, seguindo, euSigo });
});

// Seguir, deixar de seguir e listar seguidores/seguindo agora são do serviço social
// (services/social). O gateway encaminha /api/usuarios/:id/{seguir,seguidores,seguindo} para ele.

// GET /api/usuarios/:id/resumo  (início do perfil: rotação, atividade, estatísticas, fila)
router.get("/:id/resumo", async (req, res) => {
  const usuario = usuarioOuErro(idParam(req.params.id));

  const rotacaoLinhas = db
    .prepare(
      `SELECT o.* FROM rotacao r JOIN obras o ON o.id = r.obra_id
       WHERE r.usuario_id = ? ORDER BY r.criado_em, o.id`
    )
    .all(usuario.id);
  const rotacao = { lendo: [], jogando: [], assistindo: [] };
  for (const o of rotacaoLinhas) rotacao[ACAO_POR_CATEGORIA[o.categoria]].push(obraResumo(o));

  // fila = 3 últimas da wishlist (que é do serviço services/wishlist; fora do ar = fila vazia)
  const idsFila = await wishlistRecentes(usuario.id, 3);
  const obrasFila = idsFila.length
    ? new Map(
        db
          .prepare(`SELECT * FROM obras WHERE id IN (${idsFila.map(() => "?").join(",")})`)
          .all(...idsFila)
          .map((o) => [o.id, o])
      )
    : new Map();
  const fila = idsFila.map((id) => obrasFila.get(id)).filter(Boolean).map(obraResumo);

  const atividade = db
    .prepare(`${SELECT_LOG} WHERE l.usuario_id = ? ORDER BY l.data DESC, l.id DESC LIMIT 3`)
    .all(usuario.id)
    .map(logJson);

  const anoAtual = String(new Date().getFullYear());
  const estatisticas = [
    { categoria: "livro", nome: "livros", cor: "#7A81E1" },
    { categoria: "serie", nome: "séries", cor: "#f1d37f" },
    { categoria: "jogo", nome: "jogos", cor: "#75D9E6" },
  ].map(({ categoria, nome, cor }) => ({
    nome,
    cor,
    total: db
      .prepare(
        `SELECT COUNT(DISTINCT l.obra_id) AS n FROM logs l JOIN obras o ON o.id = l.obra_id
         WHERE l.usuario_id = ? AND o.categoria = ?`
      )
      .get(usuario.id, categoria).n,
    ano: db
      .prepare(
        `SELECT COUNT(*) AS n FROM logs l JOIN obras o ON o.id = l.obra_id
         WHERE l.usuario_id = ? AND o.categoria = ? AND substr(l.data, 1, 4) = ?`
      )
      .get(usuario.id, categoria, anoAtual).n,
  }));

  res.json({ rotacao, fila, atividade, estatisticas });
});

// GET /api/usuarios/:id/logs?apenasReviews=1
router.get("/:id/logs", (req, res) => {
  const usuario = usuarioOuErro(idParam(req.params.id));
  const filtro = req.query.apenasReviews === "1" ? "AND l.texto <> ''" : "";
  const linhas = db
    .prepare(`${SELECT_LOG} WHERE l.usuario_id = ? ${filtro} ORDER BY l.data DESC, l.id DESC`)
    .all(usuario.id);
  res.json(linhas.map(logJson));
});

// GET /api/usuarios/:id/acervo  (obras que a pessoa já registrou)
router.get("/:id/acervo", (req, res) => {
  const usuario = usuarioOuErro(idParam(req.params.id));
  const linhas = db
    .prepare(
      `SELECT o.*, MAX(l.data) AS ultimo FROM logs l JOIN obras o ON o.id = l.obra_id
       WHERE l.usuario_id = ? GROUP BY o.id ORDER BY ultimo DESC, o.id DESC`
    )
    .all(usuario.id);
  res.json(linhas.map(obraResumo));
});

// Favoritos e wishlist (GET /api/usuarios/:id/favoritos e /wishlist) agora são dos serviços
// services/favoritos e services/wishlist. O gateway encaminha essas rotas para eles.

export default router;
