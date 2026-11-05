// Testa o serviço de favoritos isolado: o monólito é substituído por um servidor falso.
// Rodar com: npm test
process.env.NODE_ENV = "test";
process.env.FAVORITOS_DB_PATH = ":memory:";
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
  if (url.pathname === "/api/interno/favoritos") {
    if (req.headers["x-token-interno"] !== "interno-teste") return json(401, {});
    return json(200, [
      { usuario_id: 1, obra_id: 8, criado_em: "2025-01-02 10:00:00" },
      { usuario_id: 1, obra_id: 1, criado_em: "2025-01-01 10:00:00" },
      { usuario_id: 2, obra_id: 2, criado_em: "2025-01-03 10:00:00" },
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
const favoritar = (usuario, obraId) => chamar("POST", "/me/favoritos", { tk: token(usuario), corpo: { obraId } });
const titulos = (r, categoria) => r.corpo[categoria].map((o) => o.titulo);

test("importa uma única vez os favoritos do monólito, mantendo a ordem", async () => {
  const { importarDoLegado } = await import("../src/importar.js");
  const r = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(r.importados, 3); // os dois registros inválidos foram ignorados

  const segunda = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(segunda.jaFeito, true);

  const lista = await chamar("GET", "/usuarios/1/favoritos");
  assert.equal(lista.status, 200);
  assert.deepEqual(lista.corpo, {
    livro: [{ id: 1, titulo: "Duna", ano: 1965, categoria: "livro", imagem: null }],
    serie: [{ id: 8, titulo: "Andor", ano: 2022, categoria: "serie", imagem: null }],
    jogo: [],
  });
});

test("favoritar exige login, valida e é idempotente", async () => {
  assert.equal((await chamar("POST", "/me/favoritos", { corpo: { obraId: 3 } })).status, 401);
  assert.equal((await chamar("POST", "/me/favoritos", { tk: "token-ruim", corpo: { obraId: 3 } })).status, 401);
  assert.equal((await favoritar(1, "abc")).status, 400);
  assert.equal((await chamar("POST", "/me/favoritos", { tk: token(1) })).status, 400); // sem corpo
  assert.equal((await favoritar(1, 99)).status, 404); // obra inexistente
  assert.equal((await favoritar(99, 3)).status, 401); // conta apagada

  const primeira = await favoritar(1, 3);
  assert.equal(primeira.status, 201);
  assert.deepEqual(primeira.corpo, { obraId: 3 });
  assert.equal((await favoritar(1, 3)).status, 201); // repetir não duplica
  assert.deepEqual(titulos(await chamar("GET", "/usuarios/1/favoritos"), "jogo"), ["Celeste"]);
});

test("limite de 5 por categoria; repetir um já favoritado não conta", async () => {
  // Bruno já tem o jogo 2 (importado)
  for (const id of [3, 4, 5, 6]) assert.equal((await favoritar(2, id)).status, 201);
  const estourou = await favoritar(2, 7);
  assert.equal(estourou.status, 400);
  assert.match(estourou.corpo.mensagem, /5 jogos/);

  assert.equal((await favoritar(2, 2)).status, 201); // já era favorito: não é erro
  assert.equal((await favoritar(2, 1)).status, 201); // outra categoria tem o próprio limite

  const lista = await chamar("GET", "/usuarios/2/favoritos");
  assert.deepEqual(titulos(lista, "jogo"), ["Hades", "Celeste", "Balatro", "Cuphead", "Stardew Valley"]);
  assert.deepEqual(titulos(lista, "livro"), ["Duna"]);

  // abrir vaga libera o limite
  assert.equal((await chamar("DELETE", "/me/favoritos/2", { tk: token(2) })).status, 204);
  assert.equal((await favoritar(2, 7)).status, 201);
});

test("a lista é pública, exige usuário existente e esconde obras apagadas", async () => {
  assert.equal((await chamar("GET", "/usuarios/99/favoritos")).status, 404);
  assert.equal((await chamar("GET", "/usuarios/abc/favoritos")).status, 400);
  assert.deepEqual((await chamar("GET", "/usuarios/3/favoritos")).corpo, { livro: [], serie: [], jogo: [] });

  obrasApagadas = new Set([3]); // a obra some do monólito sem o serviço ser avisado
  assert.deepEqual(titulos(await chamar("GET", "/usuarios/1/favoritos"), "jogo"), []);
  obrasApagadas = new Set();
});

test("remover favorito exige login e é idempotente", async () => {
  assert.equal((await chamar("DELETE", "/me/favoritos/3")).status, 401);
  assert.equal((await chamar("DELETE", "/me/favoritos/abc", { tk: token(1) })).status, 400);
  assert.equal((await chamar("DELETE", "/me/favoritos/3", { tk: token(1) })).status, 204);
  assert.equal((await chamar("DELETE", "/me/favoritos/3", { tk: token(1) })).status, 204);
  assert.deepEqual(titulos(await chamar("GET", "/usuarios/1/favoritos"), "jogo"), []);
});

test("rotas internas exigem token e limpam por obra e por usuário", async () => {
  assert.equal((await chamar("GET", "/interno/tem/1/1")).status, 401);
  assert.equal((await chamar("DELETE", "/interno/obras/1")).status, 401);
  assert.equal((await chamar("DELETE", "/interno/usuarios/1")).status, 401);

  assert.deepEqual((await chamar("GET", "/interno/tem/1/1", { extra: interno })).corpo, { tem: true });
  assert.deepEqual((await chamar("GET", "/interno/tem/1/2", { extra: interno })).corpo, { tem: false });
  assert.equal((await chamar("GET", "/interno/tem/abc/1", { extra: interno })).status, 400);

  // obra 1 (Duna) apagada: some para todo mundo
  assert.equal((await chamar("DELETE", "/interno/obras/1", { extra: interno })).status, 204);
  assert.deepEqual((await chamar("GET", "/interno/tem/1/1", { extra: interno })).corpo, { tem: false });
  assert.deepEqual((await chamar("GET", "/interno/tem/2/1", { extra: interno })).corpo, { tem: false });
  assert.deepEqual((await chamar("GET", "/interno/tem/1/8", { extra: interno })).corpo, { tem: true }); // outras ficam

  // conta do Bruno apagada: some tudo dele, o resto fica
  assert.equal((await chamar("DELETE", "/interno/usuarios/2", { extra: interno })).status, 204);
  assert.deepEqual((await chamar("GET", "/usuarios/2/favoritos")).corpo, { livro: [], serie: [], jogo: [] });
  assert.equal((await chamar("GET", "/interno/tem/1/8", { extra: interno })).corpo.tem, true);
});

test("se o monólito cair, favoritar e listar respondem 503 (e não 500)", async () => {
  legadoNoAr = false;
  const r = await favoritar(1, 3);
  assert.equal(r.status, 503);
  assert.match(r.corpo.mensagem, /indispon/);
  assert.equal((await chamar("GET", "/usuarios/1/favoritos")).status, 503);

  // remover e as rotas internas não dependem do monólito
  assert.equal((await chamar("DELETE", "/me/favoritos/8", { tk: token(1) })).status, 204);
  assert.equal((await chamar("GET", "/interno/tem/1/8", { extra: interno })).corpo.tem, false);
  legadoNoAr = true;
  assert.equal((await favoritar(1, 3)).status, 201); // voltou ao normal
});

test("rota inexistente e JSON inválido devolvem { mensagem }", async () => {
  const r = await chamar("GET", "/nada");
  assert.equal(r.status, 404);
  assert.equal(r.corpo.mensagem, "Rota não encontrada.");

  const ruim = await fetch(`${base}/me/favoritos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token(1)}` },
    body: "{quebrado",
  });
  assert.equal(ruim.status, 400);
  assert.equal((await ruim.json()).mensagem, "JSON inválido.");
});
