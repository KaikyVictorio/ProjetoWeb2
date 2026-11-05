import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Banco PRÓPRIO do serviço: nenhum outro serviço lê ou escreve aqui.
const caminho = process.env.WISHLIST_DB_PATH || path.resolve("data/wishlist.db");
if (caminho !== ":memory:") fs.mkdirSync(path.dirname(caminho), { recursive: true });

export const db = new DatabaseSync(caminho);

// Sem FOREIGN KEY de propósito: usuários e obras moram em outro serviço.
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    usuario_id INTEGER NOT NULL,
    obra_id    INTEGER NOT NULL,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (usuario_id, obra_id)
  );
  CREATE INDEX IF NOT EXISTS idx_wishlist_obra ON wishlist(obra_id);

  -- Guarda marcadores, ex.: se os dados antigos já foram importados do monólito
  CREATE TABLE IF NOT EXISTS meta (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

export function transacao(fn) {
  db.exec("BEGIN");
  try {
    const resultado = fn();
    db.exec("COMMIT");
    return resultado;
  } catch (erro) {
    db.exec("ROLLBACK");
    throw erro;
  }
}
