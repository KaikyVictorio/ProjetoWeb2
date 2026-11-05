// Testa o serviço de wishlist isolado: o monólito é substituído por um servidor falso.
// Rodar com: npm test
process.env.NODE_ENV = "test";
process.env.WISHLIST_DB_PATH = ":memory:";
process.env.JWT_SECRET = "teste";
process.env.INTERNAL_TOKEN = "interno-teste";

import http from "node:http";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

// --- monólito falso: usuários 1 (ana), 2 (bruno), 3 (carla) e 8 obras ---
const USUARIOS = [
  { id: 1, nome: "Ana", usuario: "ana", foto: "" },
  { id: 2, nome: "Bruno", usuario: "bruno", foto: "" },
  { id: 3, nome: "Carla", usuario: "carla", foto: "" },
];
const OBRAS = [
  { id: 1, titulo: "Duna", ano: 1965, categoria: "livro", imagem: null, autor: "Frank Herbert" },
  { id: 2, titulo: "Hades", ano: 2020, categoria: "jogo", imagem: "http://img/hades.png" },
  { id: 3, titulo: "Celeste", ano: 2018, categoria: "jogo", imagem: null },
  { id: 4, titulo: "Balatro", ano: 2024, categoria: "jogo", imagem: null },
  { id: 5, titulo: "Cuphead", ano: 2017, categoria: "jogo", imagem: null },
  { id: 6, titulo: "Stardew Valley", ano: 2016, categoria: "jogo", imagem: null },
  { id: 7, titulo: "Hollow Knight", ano: 2017, categoria: "jogo", imagem: null },
  { id: 8, titulo: "Andor", ano: 2022, categoria: "serie", imagem: null },
];
let legadoNoAr = true;
let obrasApagadas = new Set();
const legado = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const json = (status, corpo) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(corpo));
  };
  if (!legadoNoAr) return json(500, {});
  const ids = () => (url.searchParams.get("ids") ?? "").split(",").map(Number);
  if (url.pathname === "/api/usuarios") return json(200, USUARIOS.filter((u) => ids().includes(u.id)));
  if (url.pathname === "/api/obras") {
    return json(200, OBRAS.filter((o) => ids().includes(o.id) && !obrasApagadas.has(o.id)));
  }
  if (url.pathname === "/api/interno/wishlist") {
    if (req.headers["x-token-interno"] !== "interno-teste") return json(401, {});
    return json(200, [
      { usuario_id: 1, obra_id: 1, criado_em: "2025-01-01 10:00:00" },
      { usuario_id: 1, obra_id: 8, criado_em: "2025-01-03 10:00:00" },
      { usuario_id: 1, obra_id: 2, criado_em: "2025-01-02 10:00:00" },
      { usuario_id: 2, obra_id: 3, criado_em: "2025-01-03 10:00:00" },
      { usuario_id: 3, obra_id: 0, criado_em: "2025-01-03 10:00:00" }, // inválido: obra 0
      { usuario_id: "x", obra_id: 1, criado_em: "2025-01-03 10:00:00" }, // inválido: usuário
    ]);
  }
  json(404, {});
});

let servidor;
let base;
let app;
const token = (id) => jwt.sign({ sub: id }, "teste");
const interno = { "x-token-interno": "interno-teste" };

before(async () => {
  await new Promise((ok) => legado.listen(0, ok));
  process.env.LEGADO_URL = `http://127.0.0.1:${legado.address().port}`;
  ({ app } = await import("../src/index.js"));
  await new Promise((ok) => {
    servidor = app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => {
  servidor.close();
  legado.close();
});

async function chamar(metodo, caminho, { tk, corpo, extra = {} } = {}) {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: {
      ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
      ...extra,
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  return { status: r.status, corpo: texto ? JSON.parse(texto) : null };
}
const adicionar = (usuario, obraId) => chamar("POST", "/me/wishlist", { tk: token(usuario), corpo: { obraId } });
const titulos = (r, categoria) => r.corpo[categoria].map((o) => o.titulo);

test("importa uma única vez a wishlist do monólito, mantendo a ordem", async () => {
  const { importarDoLegado } = await import("../src/importar.js");
  const r = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(r.importados, 4); // os dois registros inválidos foram ignorados

  const segunda = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(segunda.jaFeito, true);

  // mais recentes primeiro: Andor (03/01), Hades (02/01), Duna (01/01)
  const lista = await chamar("GET", "/usuarios/1/wishlist");
  assert.equal(lista.status, 200);
  assert.deepEqual(lista.corpo, {
    livro: [{ id: 1, titulo: "Duna", ano: 1965, categoria: "livro", imagem: null }],
    serie: [{ id: 8, titulo: "Andor", ano: 2022, categoria: "serie", imagem: null }],
    jogo: [{ id: 2, titulo: "Hades", ano: 2020, categoria: "jogo", imagem: "http://img/hades.png" }],
  });
});

test("adicionar exige login, valida e é idempotente", async () => {
  assert.equal((await chamar("POST", "/me/wishlist", { corpo: { obraId: 3 } })).status, 401);
  assert.equal((await chamar("POST", "/me/wishlist", { tk: "token-ruim", corpo: { obraId: 3 } })).status, 401);
  assert.equal((await adicionar(1, "abc")).status, 400);
  assert.equal((await chamar("POST", "/me/wishlist", { tk: token(1) })).status, 400); // sem corpo
  assert.equal((await adicionar(1, 99)).status, 404); // obra inexistente
  assert.equal((await adicionar(99, 3)).status, 401); // conta apagada

  const primeira = await adicionar(1, 3);
  assert.equal(primeira.status, 201);
  assert.deepEqual(primeira.corpo, { obraId: 3 });
  assert.equal((await adicionar(1, 3)).status, 201); // repetir não duplica
  assert.deepEqual(titulos(await chamar("GET", "/usuarios/1/wishlist"), "jogo"), ["Celeste", "Hades"]);
});

test("a wishlist não tem limite por categoria", async () => {
  for (const id of [2, 3, 4, 5, 6, 7]) assert.equal((await adicionar(3, id)).status, 201);
  const lista = await chamar("GET", "/usuarios/3/wishlist");
  assert.equal(lista.corpo.jogo.length, 6);
  // mesmo segundo de criação: desempata pelo id da obra, do maior para o menor
  assert.deepEqual(lista.corpo.jogo.map((o) => o.id), [7, 6, 5, 4, 3, 2]);
});

test("a lista é pública, exige usuário existente e esconde obras apagadas", async () => {
  assert.equal((await chamar("GET", "/usuarios/99/wishlist")).status, 404);
  assert.equal((await chamar("GET", "/usuarios/abc/wishlist")).status, 400);
  assert.deepEqual((await chamar("GET", "/usuarios/2/wishlist")).corpo.jogo.map((o) => o.id), [3]);

  obrasApagadas = new Set([3]); // a obra some do monólito sem o serviço ser avisado
  assert.deepEqual((await chamar("GET", "/usuarios/2/wishlist")).corpo, { livro: [], serie: [], jogo: [] });
  obrasApagadas = new Set();
});

test("remover da wishlist exige login e é idempotente", async () => {
  assert.equal((await chamar("DELETE", "/me/wishlist/3")).status, 401);
  assert.equal((await chamar("DELETE", "/me/wishlist/abc", { tk: token(1) })).status, 400);
  assert.equal((await chamar("DELETE", "/me/wishlist/3", { tk: token(1) })).status, 204);
  assert.equal((await chamar("DELETE", "/me/wishlist/3", { tk: token(1) })).status, 204);
  assert.deepEqual(titulos(await chamar("GET", "/usuarios/1/wishlist"), "jogo"), ["Hades"]);
});

test("rotas internas exigem token, listam os recentes e limpam por obra e por usuário", async () => {
  assert.equal((await chamar("GET", "/interno/tem/1/1")).status, 401);
  assert.equal((await chamar("GET", "/interno/recentes/1")).status, 401);
  assert.equal((await chamar("DELETE", "/interno/obras/1")).status, 401);
  assert.equal((await chamar("DELETE", "/interno/usuarios/1")).status, 401);

  assert.deepEqual((await chamar("GET", "/interno/tem/1/1", { extra: interno })).corpo, { tem: true });
  assert.deepEqual((await chamar("GET", "/interno/tem/1/3", { extra: interno })).corpo, { tem: false });
  assert.equal((await chamar("GET", "/interno/tem/abc/1", { extra: interno })).status, 400);

  // Ana tem 8 (03/01), 2 (02/01) e 1 (01/01)
  const tres = await chamar("GET", "/interno/recentes/1", { extra: interno });
  assert.deepEqual(tres.corpo, { obraIds: [8, 2, 1] }); // padrão: 3
  assert.deepEqual((await chamar("GET", "/interno/recentes/1?limite=2", { extra: interno })).corpo, { obraIds: [8, 2] });
  assert.deepEqual((await chamar("GET", "/interno/recentes/99", { extra: interno })).corpo, { obraIds: [] });

  // obra 8 apagada: some para todo mundo
  assert.equal((await chamar("DELETE", "/interno/obras/8", { extra: interno })).status, 204);
  assert.deepEqual((await chamar("GET", "/interno/recentes/1", { extra: interno })).corpo, { obraIds: [2, 1] });

  // conta da Carla apagada: some tudo dela, o resto fica
  assert.equal((await chamar("DELETE", "/interno/usuarios/3", { extra: interno })).status, 204);
  assert.deepEqual((await chamar("GET", "/usuarios/3/wishlist")).corpo, { livro: [], serie: [], jogo: [] });
  assert.equal((await chamar("GET", "/interno/tem/1/2", { extra: interno })).corpo.tem, true);
});

test("se o monólito cair, adicionar e listar respondem 503 (e não 500)", async () => {
  legadoNoAr = false;
  const r = await adicionar(1, 3);
  assert.equal(r.status, 503);
  assert.match(r.corpo.mensagem, /indispon/);
  assert.equal((await chamar("GET", "/usuarios/1/wishlist")).status, 503);

  // remover e as rotas internas não dependem do monólito
  assert.equal((await chamar("DELETE", "/me/wishlist/2", { tk: token(1) })).status, 204);
  assert.equal((await chamar("GET", "/interno/tem/1/2", { extra: interno })).corpo.tem, false);
  legadoNoAr = true;
  assert.equal((await adicionar(1, 3)).status, 201); // voltou ao normal
});

test("rota inexistente e JSON inválido devolvem { mensagem }", async () => {
  const r = await chamar("GET", "/nada");
  assert.equal(r.status, 404);
  assert.equal(r.corpo.mensagem, "Rota não encontrada.");

  const ruim = await fetch(`${base}/me/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token(1)}` },
    body: "{quebrado",
  });
  assert.equal(ruim.status, 400);
  assert.equal((await ruim.json()).mensagem, "JSON inválido.");
});
