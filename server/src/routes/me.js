import { Router } from "express";
import { db } from "../db.js";
import { exigirLogin } from "../auth.js";
import { ErroHttp, idParam } from "../util.js";

// Favoritos, wishlist e rotação atual do usuário logado.
// Cada coleção tem: POST { obraId } para adicionar e DELETE /:obraId para remover.
const router = Router();
router.use(exigirLogin);

const MAX_FAVORITOS = 5; // por categoria
const MAX_ROTACAO = 4; // por categoria

const NOMES = { livro: "livros", serie: "séries", jogo: "jogos" };

function colecao(tabela, { limite, mensagemLimite } = {}) {
  router.post(`/${tabela}`, (req, res) => {
    const obraId = idParam(req.body.obraId, "Obra");
    const obra = db.prepare("SELECT id, categoria FROM obras WHERE id = ?").get(obraId);
    if (!obra) throw new ErroHttp(404, "Obra não encontrada.");

    const jaTem = db
      .prepare(`SELECT 1 FROM ${tabela} WHERE usuario_id = ? AND obra_id = ?`)
      .get(req.usuario.id, obra.id);

    if (!jaTem && limite) {
      const { n } = db
        .prepare(
          `SELECT COUNT(*) AS n FROM ${tabela} t JOIN obras o ON o.id = t.obra_id
           WHERE t.usuario_id = ? AND o.categoria = ?`
        )
        .get(req.usuario.id, obra.categoria);
      if (n >= limite) throw new ErroHttp(400, mensagemLimite(obra.categoria));
    }

    db.prepare(`INSERT OR IGNORE INTO ${tabela} (usuario_id, obra_id) VALUES (?, ?)`).run(req.usuario.id, obra.id);
    res.status(201).json({ obraId: obra.id });
  });

  router.delete(`/${tabela}/:obraId`, (req, res) => {
    db.prepare(`DELETE FROM ${tabela} WHERE usuario_id = ? AND obra_id = ?`).run(
      req.usuario.id,
      idParam(req.params.obraId, "Obra")
    );
    res.status(204).end();
  });
}

colecao("favoritos", {
  limite: MAX_FAVORITOS,
  mensagemLimite: (cat) => `Você já tem ${MAX_FAVORITOS} ${NOMES[cat]} favoritos. Remova um para adicionar outro.`,
});
colecao("wishlist");
colecao("rotacao", {
  limite: MAX_ROTACAO,
  mensagemLimite: (cat) => `Sua rotação já tem ${MAX_ROTACAO} ${NOMES[cat]}. Remova um para adicionar outro.`,
});

export default router;
