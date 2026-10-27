import { Router } from "express";
import { db } from "../db.js";
import { exigirLogin, loginOpcional } from "../auth.js";
import { logJson, obraJson, SELECT_LOG } from "../serializers.js";
import { ErroHttp, idParam, like, nota, paginacao, texto } from "../util.js";

const router = Router();
const CATEGORIAS = ["livro", "serie", "jogo"];

function dadosDaObra(body) {
  const titulo = texto(body.titulo, 150);
  if (!titulo) throw new ErroHttp(400, "Informe o título da obra.");

  const categoria = texto(body.categoria, 10);
  if (!CATEGORIAS.includes(categoria)) throw new ErroHttp(400, "Categoria inválida (livro, serie ou jogo).");

  let ano = null;
  if (body.ano !== undefined && body.ano !== null && body.ano !== "") {
    ano = Number(body.ano);
    if (!Number.isInteger(ano) || ano < 1000 || ano > new Date().getFullYear() + 5) {
      throw new ErroHttp(400, "Ano inválido.");
    }
  }

  const generos = Array.isArray(body.generos)
    ? body.generos.map((g) => texto(g, 40)).filter(Boolean).slice(0, 10)
    : [];

  return {
    titulo,
    categoria,
    ano,
    imagem: texto(body.imagem, 500) || null,
    autor: texto(body.autor, 120),
    generos: JSON.stringify(generos),
    sinopse: texto(body.sinopse, 3000),
  };
}

function obraOuErro(id) {
  const obra = db.prepare("SELECT * FROM obras WHERE id = ?").get(id);
  if (!obra) throw new ErroHttp(404, "Obra não encontrada.");
  return obra;
}

function exigirDono(obra, usuario) {
  if (obra.criado_por !== usuario.id) {
    throw new ErroHttp(403, "Só quem cadastrou a obra pode alterá-la.");
  }
}

// GET /api/obras?q=&categoria=&limite=&offset=
router.get("/", (req, res) => {
  const { limite, offset } = paginacao(req.query);
  const condicoes = [];
  const params = [];

  const q = texto(req.query.q, 100);
  if (q) {
    condicoes.push("titulo LIKE ? ESCAPE '\\'");
    params.push(like(q));
  }
  if (CATEGORIAS.includes(req.query.categoria)) {
    condicoes.push("categoria = ?");
    params.push(req.query.categoria);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
  const linhas = db
    .prepare(`SELECT * FROM obras ${where} ORDER BY titulo COLLATE NOCASE LIMIT ? OFFSET ?`)
    .all(...params, limite, offset);
  res.json(linhas.map(obraJson));
});

// POST /api/obras
router.post("/", exigirLogin, (req, res) => {
  const d = dadosDaObra(req.body);
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO obras (titulo, ano, categoria, imagem, autor, generos, sinopse, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(d.titulo, d.ano, d.categoria, d.imagem, d.autor, d.generos, d.sinopse, req.usuario.id);
  res.status(201).json(obraJson(obraOuErro(lastInsertRowid)));
});

// GET /api/obras/:id  (com média e, se logado, o que o usuário já fez com ela)
router.get("/:id", loginOpcional, (req, res) => {
  const obra = obraOuErro(idParam(req.params.id));
  const { media, total } = db
    .prepare("SELECT AVG(nota) AS media, COUNT(*) AS total FROM notas WHERE obra_id = ? AND nota > 0")
    .get(obra.id);

  const resposta = { ...obraJson(obra), media: media ?? null, totalNotas: total };

  if (req.usuario) {
    const uid = req.usuario.id;
    resposta.minha = {
      nota: db.prepare("SELECT nota FROM notas WHERE usuario_id = ? AND obra_id = ?").get(uid, obra.id)?.nota ?? 0,
      favorito: Boolean(db.prepare("SELECT 1 FROM favoritos WHERE usuario_id = ? AND obra_id = ?").get(uid, obra.id)),
      wishlist: Boolean(db.prepare("SELECT 1 FROM wishlist WHERE usuario_id = ? AND obra_id = ?").get(uid, obra.id)),
    };
  }
  res.json(resposta);
});

// PUT /api/obras/:id
router.put("/:id", exigirLogin, (req, res) => {
  const obra = obraOuErro(idParam(req.params.id));
  exigirDono(obra, req.usuario);
  const d = dadosDaObra(req.body);
  db.prepare(
    `UPDATE obras SET titulo = ?, ano = ?, categoria = ?, imagem = ?, autor = ?, generos = ?, sinopse = ?
     WHERE id = ?`
  ).run(d.titulo, d.ano, d.categoria, d.imagem, d.autor, d.generos, d.sinopse, obra.id);
  res.json(obraJson(obraOuErro(obra.id)));
});

// DELETE /api/obras/:id
router.delete("/:id", exigirLogin, (req, res) => {
  const obra = obraOuErro(idParam(req.params.id));
  exigirDono(obra, req.usuario);
  db.prepare("DELETE FROM obras WHERE id = ?").run(obra.id);
  res.status(204).end();
});

// GET /api/obras/:id/reviews?limite=&offset=
router.get("/:id/reviews", (req, res) => {
  const obra = obraOuErro(idParam(req.params.id));
  const { limite, offset } = paginacao(req.query, 10, 50);
  const total = db
    .prepare("SELECT COUNT(*) AS n FROM logs WHERE obra_id = ? AND texto <> ''")
    .get(obra.id).n;
  const itens = db
    .prepare(`${SELECT_LOG} WHERE l.obra_id = ? AND l.texto <> '' ORDER BY l.data DESC, l.id DESC LIMIT ? OFFSET ?`)
    .all(obra.id, limite, offset)
    .map(logJson);
  res.json({ total, itens });
});

// PUT /api/obras/:id/nota  { nota }  (0 remove a nota)
router.put("/:id/nota", exigirLogin, (req, res) => {
  const obra = obraOuErro(idParam(req.params.id));
  const valor = nota(req.body.nota);
  if (valor === 0) {
    db.prepare("DELETE FROM notas WHERE usuario_id = ? AND obra_id = ?").run(req.usuario.id, obra.id);
  } else {
    db.prepare(
      `INSERT INTO notas (usuario_id, obra_id, nota) VALUES (?, ?, ?)
       ON CONFLICT (usuario_id, obra_id) DO UPDATE SET nota = excluded.nota`
    ).run(req.usuario.id, obra.id, valor);
  }
  const { media, total } = db
    .prepare("SELECT AVG(nota) AS media, COUNT(*) AS total FROM notas WHERE obra_id = ? AND nota > 0")
    .get(obra.id);
  res.json({ nota: valor, media: media ?? null, totalNotas: total });
});

export default router;
