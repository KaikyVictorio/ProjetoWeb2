import express from "express";
import { db } from "./db.js";
import { exigirLogin, somenteInterno } from "./auth.js";
import { buscarObras, buscarUsuarios } from "./legado.js";
import { importarDoLegado } from "./importar.js";
import { ErroHttp, idParam } from "./util.js";

export const app = express();
app.use(express.json({ limit: "10kb" }));

const MAX_POR_CATEGORIA = 5;
const NOMES = { livro: "livros", serie: "séries", jogo: "jogos" };

// Versão enxuta da obra, para capas e listas
const resumo = (o) => ({
  id: o.id,
  titulo: o.titulo,
  ano: o.ano,
  categoria: o.categoria,
  imagem: o.imagem || null,
});

app.get("/health", (_req, res) => res.json({ servico: "favoritos", status: "ok" }));

// ---------- Rotas públicas (o gateway repassa /api/me/favoritos e /api/usuarios/:id/favoritos para cá) ----------

// POST /me/favoritos  { obraId }  (idempotente; até 5 por categoria)
app.post("/me/favoritos", exigirLogin, async (req, res) => {
  const obraId = idParam(req.body?.obraId, "Obra");

  // Usuários e obras moram no monólito: confirma que a conta e a obra existem
  const [usuarios, obras] = await Promise.all([buscarUsuarios([req.usuarioId]), buscarObras([obraId])]);
  if (usuarios.length === 0) throw new ErroHttp(401, "Faça login para continuar.");
  const obra = obras[0];
  if (!obra) throw new ErroHttp(404, "Obra não encontrada.");

  const jaTem = db
    .prepare("SELECT 1 FROM favoritos WHERE usuario_id = ? AND obra_id = ?")
    .get(req.usuarioId, obra.id);

  if (!jaTem) {
    // A categoria pode mudar na obra, então é sempre lida do monólito (não é guardada aqui)
    const ids = db
      .prepare("SELECT obra_id FROM favoritos WHERE usuario_id = ?")
      .all(req.usuarioId)
      .map((l) => l.obra_id);
    const daCategoria = (await buscarObras(ids)).filter((o) => o.categoria === obra.categoria).length;
    if (daCategoria >= MAX_POR_CATEGORIA) {
      throw new ErroHttp(
        400,
        `Você já tem ${MAX_POR_CATEGORIA} ${NOMES[obra.categoria]} favoritos. Remova um para adicionar outro.`
      );
    }
  }

  db.prepare("INSERT OR IGNORE INTO favoritos (usuario_id, obra_id) VALUES (?, ?)").run(req.usuarioId, obra.id);
  res.status(201).json({ obraId: obra.id });
});

// DELETE /me/favoritos/:obraId  (idempotente)
app.delete("/me/favoritos/:obraId", exigirLogin, (req, res) => {
  db.prepare("DELETE FROM favoritos WHERE usuario_id = ? AND obra_id = ?").run(
    req.usuarioId,
    idParam(req.params.obraId, "Obra")
  );
  res.status(204).end();
});

// GET /usuarios/:id/favoritos  -> { livro: [], serie: [], jogo: [] }
app.get("/usuarios/:id/favoritos", async (req, res) => {
  const id = idParam(req.params.id, "Usuário");
  const ids = db
    .prepare("SELECT obra_id FROM favoritos WHERE usuario_id = ? ORDER BY criado_em, obra_id")
    .all(id)
    .map((l) => l.obra_id);

  const [usuarios, obras] = await Promise.all([buscarUsuarios([id]), buscarObras(ids)]);
  if (usuarios.length === 0) throw new ErroHttp(404, "Usuário não encontrado.");

  // mantém a ordem e descarta obras que já foram apagadas
  const porId = new Map(obras.map((o) => [o.id, o]));
  const grupos = { livro: [], serie: [], jogo: [] };
  for (const obraId of ids) {
    const o = porId.get(obraId);
    if (o) grupos[o.categoria]?.push(resumo(o));
  }
  res.json(grupos);
});

// ---------- Rotas internas (só outros serviços, com x-token-interno) ----------

// GET /interno/tem/:usuarioId/:obraId  -> usado pelo monólito na página da obra ("minha.favorito")
app.get("/interno/tem/:usuarioId/:obraId", somenteInterno, (req, res) => {
  const linha = db
    .prepare("SELECT 1 FROM favoritos WHERE usuario_id = ? AND obra_id = ?")
    .get(idParam(req.params.usuarioId, "Usuário"), idParam(req.params.obraId, "Obra"));
  res.json({ tem: Boolean(linha) });
});

// DELETE /interno/usuarios/:id  -> o monólito avisa que a conta foi apagada
app.delete("/interno/usuarios/:id", somenteInterno, (req, res) => {
  db.prepare("DELETE FROM favoritos WHERE usuario_id = ?").run(idParam(req.params.id, "Usuário"));
  res.status(204).end();
});

// DELETE /interno/obras/:id  -> o monólito avisa que a obra foi apagada
app.delete("/interno/obras/:id", somenteInterno, (req, res) => {
  db.prepare("DELETE FROM favoritos WHERE obra_id = ?").run(idParam(req.params.id, "Obra"));
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
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, "0.0.0.0", (erro) => {
    if (erro) throw erro; // Express 5 entrega o erro de listen (ex.: porta ocupada) aqui
    console.log(`[favoritos] rodando na porta ${PORT}`);
    importarDoLegado(); // em segundo plano; tenta até o monólito subir
  });
}
