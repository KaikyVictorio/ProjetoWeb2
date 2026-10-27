import { Router } from "express";
import { db, transacao } from "../db.js";
import { exigirLogin } from "../auth.js";
import { obraResumo, usuarioBasico } from "../serializers.js";
import { ErroHttp, idParam, paginacao, texto } from "../util.js";

const router = Router();

function obrasDaLista(listaId) {
  return db
    .prepare(
      `SELECT o.* FROM lista_obras lo JOIN obras o ON o.id = lo.obra_id
       WHERE lo.lista_id = ? ORDER BY lo.posicao`
    )
    .all(listaId)
    .map(obraResumo);
}

function listaJson(l, { completa = false } = {}) {
  const autor = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(l.usuario_id);
  const obras = obrasDaLista(l.id);
  return {
    id: l.id,
    titulo: l.titulo,
    descricao: l.descricao,
    criadoEm: l.criado_em,
    autor: usuarioBasico(autor),
    total: obras.length,
    obras: completa ? obras : obras.slice(0, 5),
    obraIds: obras.map((o) => o.id),
  };
}

function dadosDaLista(body) {
  const titulo = texto(body.titulo, 80);
  if (!titulo) throw new ErroHttp(400, "Informe o nome da lista.");

  const ids = Array.isArray(body.obraIds) ? body.obraIds.map(Number) : [];
  const unicos = [...new Set(ids.filter((n) => Number.isInteger(n) && n > 0))];
  const existentes = unicos.length
    ? new Set(
        db
          .prepare(`SELECT id FROM obras WHERE id IN (${unicos.map(() => "?").join(",")})`)
          .all(...unicos)
          .map((o) => o.id)
      )
    : new Set();

  return {
    titulo,
    descricao: texto(body.descricao, 1000),
    obraIds: unicos.filter((id) => existentes.has(id)),
  };
}

function gravarObras(listaId, obraIds) {
  db.prepare("DELETE FROM lista_obras WHERE lista_id = ?").run(listaId);
  const inserir = db.prepare("INSERT INTO lista_obras (lista_id, obra_id, posicao) VALUES (?, ?, ?)");
  obraIds.forEach((obraId, i) => inserir.run(listaId, obraId, i));
}

function listaOuErro(id) {
  const lista = db.prepare("SELECT * FROM listas WHERE id = ?").get(id);
  if (!lista) throw new ErroHttp(404, "Lista não encontrada.");
  return lista;
}

function exigirDona(lista, usuario) {
  if (lista.usuario_id !== usuario.id) throw new ErroHttp(403, "Essa lista não é sua.");
}

// GET /api/listas?usuario=&limite=&offset=
router.get("/", (req, res) => {
  const { limite, offset } = paginacao(req.query, 12, 100);
  const params = [];
  let where = "";
  if (req.query.usuario) {
    where = "WHERE usuario_id = ?";
    params.push(idParam(req.query.usuario, "Usuário"));
  }
  const linhas = db
    .prepare(`SELECT * FROM listas ${where} ORDER BY criado_em DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limite, offset);
  res.json(linhas.map((l) => listaJson(l)));
});

// GET /api/listas/:id
router.get("/:id", (req, res) => {
  res.json(listaJson(listaOuErro(idParam(req.params.id)), { completa: true }));
});

// POST /api/listas  { titulo, descricao, obraIds }
router.post("/", exigirLogin, (req, res) => {
  const d = dadosDaLista(req.body);
  const id = transacao(() => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO listas (usuario_id, titulo, descricao) VALUES (?, ?, ?)")
      .run(req.usuario.id, d.titulo, d.descricao);
    gravarObras(lastInsertRowid, d.obraIds);
    return lastInsertRowid;
  });
  res.status(201).json(listaJson(listaOuErro(id), { completa: true }));
});

// PUT /api/listas/:id
router.put("/:id", exigirLogin, (req, res) => {
  const lista = listaOuErro(idParam(req.params.id));
  exigirDona(lista, req.usuario);
  const d = dadosDaLista(req.body);
  transacao(() => {
    db.prepare("UPDATE listas SET titulo = ?, descricao = ? WHERE id = ?").run(d.titulo, d.descricao, lista.id);
    gravarObras(lista.id, d.obraIds);
  });
  res.json(listaJson(listaOuErro(lista.id), { completa: true }));
});

// DELETE /api/listas/:id
router.delete("/:id", exigirLogin, (req, res) => {
  const lista = listaOuErro(idParam(req.params.id));
  exigirDona(lista, req.usuario);
  db.prepare("DELETE FROM listas WHERE id = ?").run(lista.id);
  res.status(204).end();
});

export default router;
