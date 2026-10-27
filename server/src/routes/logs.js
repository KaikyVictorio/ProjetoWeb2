import { Router } from "express";
import { db } from "../db.js";
import { exigirLogin } from "../auth.js";
import { buscarLog, logJson, SELECT_LOG } from "../serializers.js";
import { dataValida, ErroHttp, idParam, nota, paginacao, texto } from "../util.js";

const router = Router();

function dadosDoLog(body) {
  return {
    nota: nota(body.nota),
    texto: texto(body.texto, 5000),
    spoiler: body.spoiler ? 1 : 0,
    jaFeito: body.jaFeito ? 1 : 0,
    data: dataValida(body.data),
  };
}

// Mantém a "nota atual" da obra em sincronia com o último log que tem nota
function sincronizarNota(usuarioId, obraId, valor) {
  if (valor > 0) {
    db.prepare(
      `INSERT INTO notas (usuario_id, obra_id, nota) VALUES (?, ?, ?)
       ON CONFLICT (usuario_id, obra_id) DO UPDATE SET nota = excluded.nota`
    ).run(usuarioId, obraId, valor);
  }
}

function logDoUsuario(id, usuarioId) {
  const log = db.prepare("SELECT * FROM logs WHERE id = ?").get(id);
  if (!log) throw new ErroHttp(404, "Log não encontrado.");
  if (log.usuario_id !== usuarioId) throw new ErroHttp(403, "Esse log não é seu.");
  return log;
}

// GET /api/logs/feed?limite=   (atividade de toda a comunidade)
router.get("/feed", (req, res) => {
  const { limite, offset } = paginacao(req.query, 20, 50);
  const linhas = db
    .prepare(`${SELECT_LOG} ORDER BY l.data DESC, l.id DESC LIMIT ? OFFSET ?`)
    .all(limite, offset);
  res.json(linhas.map(logJson));
});

// POST /api/logs  { obraId, nota, texto, spoiler, jaFeito, data }
router.post("/", exigirLogin, (req, res) => {
  const obraId = idParam(req.body.obraId, "Obra");
  if (!db.prepare("SELECT 1 FROM obras WHERE id = ?").get(obraId)) {
    throw new ErroHttp(404, "Obra não encontrada.");
  }
  const d = dadosDoLog(req.body);

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO logs (usuario_id, obra_id, nota, texto, spoiler, ja_feito, data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.usuario.id, obraId, d.nota, d.texto, d.spoiler, d.jaFeito, d.data);

  sincronizarNota(req.usuario.id, obraId, d.nota);
  res.status(201).json(buscarLog(lastInsertRowid));
});

// PUT /api/logs/:id  { nota, texto, spoiler, jaFeito, data }
router.put("/:id", exigirLogin, (req, res) => {
  const log = logDoUsuario(idParam(req.params.id), req.usuario.id);
  const d = dadosDoLog({ data: log.data, ...req.body });

  db.prepare(
    "UPDATE logs SET nota = ?, texto = ?, spoiler = ?, ja_feito = ?, data = ? WHERE id = ?"
  ).run(d.nota, d.texto, d.spoiler, d.jaFeito, d.data, log.id);

  sincronizarNota(req.usuario.id, log.obra_id, d.nota);
  res.json(buscarLog(log.id));
});

// DELETE /api/logs/:id
router.delete("/:id", exigirLogin, (req, res) => {
  const log = logDoUsuario(idParam(req.params.id), req.usuario.id);
  db.prepare("DELETE FROM logs WHERE id = ?").run(log.id);
  res.status(204).end();
});

export default router;
