import express from "express";
import { db } from "./db.js";
import { exigirLogin, loginOpcional, somenteInterno } from "./auth.js";
import { buscarUsuarios } from "./legado.js";
import { importarDoLegado } from "./importar.js";
import { ErroHttp, idParam, paginacao } from "./util.js";

export const app = express();
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => res.json({ servico: "social", status: "ok" }));

// ---------- Rotas públicas (o gateway repassa /api/usuarios/:id/... para cá) ----------

// POST /usuarios/:id/seguir
app.post("/usuarios/:id/seguir", exigirLogin, async (req, res) => {
  const alvo = idParam(req.params.id, "Usuário");
  if (alvo === req.usuarioId) throw new ErroHttp(400, "Você não pode seguir a si mesmo.");

  // Os usuários moram no monólito: confirma que quem segue e quem é seguido existem
  const achados = new Set((await buscarUsuarios([req.usuarioId, alvo])).map((u) => u.id));
  if (!achados.has(req.usuarioId)) throw new ErroHttp(401, "Faça login para continuar.");
  if (!achados.has(alvo)) throw new ErroHttp(404, "Usuário não encontrado.");

  db.prepare("INSERT OR IGNORE INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)").run(req.usuarioId, alvo);
  res.status(204).end();
});

// DELETE /usuarios/:id/seguir  (idempotente)
app.delete("/usuarios/:id/seguir", exigirLogin, (req, res) => {
  db.prepare("DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?").run(
    req.usuarioId,
    idParam(req.params.id, "Usuário")
  );
  res.status(204).end();
});

// Lista quem segue / quem é seguido, já com nome e foto e com "euSigo" para quem está logado
async function listar(req, res, { filtro, outro }) {
  const id = idParam(req.params.id, "Usuário");
  const { limite, offset } = paginacao(req.query);

  const ids = db
    .prepare(
      `SELECT ${outro} AS id FROM seguidores WHERE ${filtro} = ?
       ORDER BY criado_em DESC, rowid DESC LIMIT ? OFFSET ?`
    )
    .all(id, limite, offset)
    .map((l) => l.id);

  const porId = new Map((await buscarUsuarios(ids)).map((u) => [u.id, u]));

  let euSigo = new Set();
  if (req.usuarioId && ids.length) {
    euSigo = new Set(
      db
        .prepare(
          `SELECT seguido_id FROM seguidores WHERE seguidor_id = ? AND seguido_id IN (${ids.map(() => "?").join(",")})`
        )
        .all(req.usuarioId, ...ids)
        .map((l) => l.seguido_id)
    );
  }

  // mantém a ordem (mais recentes primeiro) e descarta contas que já foram apagadas
  res.json(
    ids
      .filter((i) => porId.has(i))
      .map((i) => ({ ...porId.get(i), euSigo: euSigo.has(i) }))
  );
}

// GET /usuarios/:id/seguidores
app.get("/usuarios/:id/seguidores", loginOpcional, (req, res) =>
  listar(req, res, { filtro: "seguido_id", outro: "seguidor_id" })
);

// GET /usuarios/:id/seguindo
app.get("/usuarios/:id/seguindo", loginOpcional, (req, res) =>
  listar(req, res, { filtro: "seguidor_id", outro: "seguido_id" })
);

// ---------- Rotas internas (só outros serviços, com x-token-interno) ----------

// GET /interno/contagem/:id?viewer=  -> usado pelo monólito no perfil público
app.get("/interno/contagem/:id", somenteInterno, (req, res) => {
  const id = idParam(req.params.id, "Usuário");
  const viewer = Number(req.query.viewer);
  const n = (sql, ...p) => db.prepare(sql).get(...p).n;

  res.json({
    seguidores: n("SELECT COUNT(*) AS n FROM seguidores WHERE seguido_id = ?", id),
    seguindo: n("SELECT COUNT(*) AS n FROM seguidores WHERE seguidor_id = ?", id),
    euSigo:
      Number.isInteger(viewer) && viewer > 0
        ? n("SELECT COUNT(*) AS n FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?", viewer, id) > 0
        : false,
  });
});

// DELETE /interno/usuarios/:id  -> o monólito avisa que a conta foi apagada
app.delete("/interno/usuarios/:id", somenteInterno, (req, res) => {
  const id = idParam(req.params.id, "Usuário");
  db.prepare("DELETE FROM seguidores WHERE seguidor_id = ? OR seguido_id = ?").run(id, id);
  res.status(204).end();
});

// ---------- Erros ----------

app.use((_req, res) => res.status(404).json({ mensagem: "Rota não encontrada." }));

app.use((erro, _req, res, _next) => {
  if (erro.type === "entity.parse.failed") return res.status(400).json({ mensagem: "JSON inválido." });
  if (erro.status) return res.status(erro.status).json({ mensagem: erro.message });
  console.error(erro);
  res.status(500).json({ mensagem: "Erro interno do servidor." });
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, "0.0.0.0", (erro) => {
    if (erro) throw erro; // Express 5 entrega o erro de listen (ex.: porta ocupada) aqui
    console.log(`[social] rodando na porta ${PORT}`);
    importarDoLegado(); // em segundo plano; tenta até o monólito subir
  });
}
