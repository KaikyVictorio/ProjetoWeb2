import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const caminho = process.env.DB_PATH || path.resolve("data/estante.db");
if (caminho !== ":memory:") fs.mkdirSync(path.dirname(caminho), { recursive: true });

export const db = new DatabaseSync(caminho);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    usuario    TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    senha_hash TEXT NOT NULL,
    foto       TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    infos      TEXT NOT NULL DEFAULT '[]',
    criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS obras (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo     TEXT NOT NULL,
    ano        INTEGER,
    categoria  TEXT NOT NULL CHECK (categoria IN ('livro','serie','jogo')),
    imagem     TEXT,
    autor      TEXT NOT NULL DEFAULT '',
    generos    TEXT NOT NULL DEFAULT '[]',
    sinopse    TEXT NOT NULL DEFAULT '',
    criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id    INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nota       REAL NOT NULL DEFAULT 0,
    texto      TEXT NOT NULL DEFAULT '',
    spoiler    INTEGER NOT NULL DEFAULT 0,
    ja_feito   INTEGER NOT NULL DEFAULT 0,
    data       TEXT NOT NULL,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notas (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id    INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nota       REAL NOT NULL,
    PRIMARY KEY (usuario_id, obra_id)
  );

  CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id    INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (usuario_id, obra_id)
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id    INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (usuario_id, obra_id)
  );

  -- Rotação atual: a ação (lendo/jogando/assistindo) vem da categoria da obra
  CREATE TABLE IF NOT EXISTS rotacao (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id    INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (usuario_id, obra_id)
  );

  CREATE TABLE IF NOT EXISTS listas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo     TEXT NOT NULL,
    descricao  TEXT NOT NULL DEFAULT '',
    criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lista_obras (
    lista_id INTEGER NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    obra_id  INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    posicao  INTEGER NOT NULL,
    PRIMARY KEY (lista_id, obra_id)
  );

  CREATE TABLE IF NOT EXISTS seguidores (
    seguidor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (seguidor_id, seguido_id)
  );

  CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs(usuario_id, data DESC);
  CREATE INDEX IF NOT EXISTS idx_logs_obra ON logs(obra_id);
`);

// Executa várias operações como uma só (tudo ou nada)
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
