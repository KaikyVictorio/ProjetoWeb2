// Testa o serviço social isolado: o monólito é substituído por um servidor falso.
// Rodar com: npm test
process.env.NODE_ENV = "test";
process.env.SOCIAL_DB_PATH = ":memory:";
process.env.JWT_SECRET = "teste";
process.env.INTERNAL_TOKEN = "interno-teste";

import http from "node:http";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

// --- monólito falso: usuários 1 (ana), 2 (bruno), 3 (carla) ---
const USUARIOS = [
  { id: 1, nome: "Ana", usuario: "ana", foto: "" },
  { id: 2, nome: "Bruno", usuario: "bruno", foto: "" },
  { id: 3, nome: "Carla", usuario: "carla", foto: "" },
];
let legadoNoAr = true;
const legado = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const json = (status, corpo) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(corpo));
  };
  if (!legadoNoAr) return json(500, {});
  if (url.pathname === "/api/usuarios") {
    const ids = url.searchParams.get("ids").split(",").map(Number);
    return json(200, USUARIOS.filter((u) => ids.includes(u.id)));
  }
  if (url.pathname === "/api/interno/seguidores") {
    if (req.headers["x-token-interno"] !== "interno-teste") return json(401, {});
    return json(200, [
      { seguidor_id: 1, seguido_id: 2 },
      { seguidor_id: 3, seguido_id: 1 },
      { seguidor_id: 3, seguido_id: 3 }, // inválido: a própria pessoa
    ]);
  }
  json(404, {});
});

let servidor;
let base;
let app;
const token = (id) => jwt.sign({ sub: id }, "teste");

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

async function chamar(metodo, caminho, tk, extra = {}) {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: { ...(tk ? { Authorization: `Bearer ${tk}` } : {}), ...extra },
  });
  const texto = await r.text();
  return { status: r.status, corpo: texto ? JSON.parse(texto) : null };
}

test("importa uma única vez os seguidores do monólito", async () => {
  const { importarDoLegado } = await import("../src/importar.js");
  const r = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(r.importados, 2); // o par inválido foi ignorado

  const segunda = await importarDoLegado({ tentativas: 1, esperaMs: 1 });
  assert.equal(segunda.jaFeito, true);

  const lista = await chamar("GET", "/usuarios/1/seguidores");
  assert.deepEqual(lista.corpo.map((u) => u.usuario), ["carla"]);
});

test("seguir exige login, valida e é idempotente", async () => {
  assert.equal((await chamar("POST", "/usuarios/2/seguir")).status, 401);
  assert.equal((await chamar("POST", "/usuarios/2/seguir", "token-ruim")).status, 401);
  assert.equal((await chamar("POST", "/usuarios/abc/seguir", token(1))).status, 400);
  assert.equal((await chamar("POST", "/usuarios/1/seguir", token(1))).status, 400); // a si mesmo
  assert.equal((await chamar("POST", "/usuarios/99/seguir", token(1))).status, 404); // alvo inexistente
  assert.equal((await chamar("POST", "/usuarios/2/seguir", token(99))).status, 401); // conta apagada

  assert.equal((await chamar("POST", "/usuarios/3/seguir", token(2))).status, 204);
  assert.equal((await chamar("POST", "/usuarios/3/seguir", token(2))).status, 204); // repetir não duplica
  assert.equal((await chamar("GET", "/interno/contagem/3", null, { "x-token-interno": "interno-teste" })).corpo.seguidores, 1);
});

test("listas de seguidores e seguindo trazem dados do usuário e euSigo", async () => {
  // estado: 1->2, 3->1, 2->3
  const seguidoresDe3 = await chamar("GET", "/usuarios/3/seguidores", token(1));
  assert.equal(seguidoresDe3.status, 200);
  assert.deepEqual(seguidoresDe3.corpo, [{ id: 2, nome: "Bruno", usuario: "bruno", foto: "", euSigo: true }]);

  const seguindo1 = await chamar("GET", "/usuarios/1/seguindo");
  assert.deepEqual(seguindo1.corpo.map((u) => [u.usuario, u.euSigo]), [["bruno", false]]); // anônimo

  assert.deepEqual((await chamar("GET", "/usuarios/2/seguidores")).corpo.map((u) => u.id), [1]);
  assert.deepEqual((await chamar("GET", "/usuarios/3/seguindo")).corpo.map((u) => u.usuario), ["ana"]); // veio da importação
});

test("deixar de seguir", async () => {
  assert.equal((await chamar("DELETE", "/usuarios/2/seguir", token(1))).status, 204);
  assert.equal((await chamar("DELETE", "/usuarios/2/seguir", token(1))).status, 204); // idempotente
  assert.deepEqual((await chamar("GET", "/usuarios/2/seguidores")).corpo, []);
});

test("rotas internas exigem token e contam certo", async () => {
  assert.equal((await chamar("GET", "/interno/contagem/1")).status, 401);
  assert.equal((await chamar("DELETE", "/interno/usuarios/1")).status, 401);

  const h = { "x-token-interno": "interno-teste" };
  // 3->1 e 2->3 existem; 1 tem 1 seguidor e segue 0
  const c = await chamar("GET", "/interno/contagem/1?viewer=3", null, h);
  assert.deepEqual(c.corpo, { seguidores: 1, seguindo: 0, euSigo: true });
  assert.equal((await chamar("GET", "/interno/contagem/1?viewer=2", null, h)).corpo.euSigo, false);

  // conta da Carla (3) apagada: some quem ela seguia e quem a seguia
  assert.equal((await chamar("DELETE", "/interno/usuarios/3", null, h)).status, 204);
  assert.deepEqual((await chamar("GET", "/interno/contagem/1", null, h)).corpo, { seguidores: 0, seguindo: 0, euSigo: false });
});

test("se o monólito cair, escrita e listas respondem 503 (e não 500)", async () => {
  legadoNoAr = false;
  const r = await chamar("POST", "/usuarios/2/seguir", token(1));
  assert.equal(r.status, 503);
  assert.match(r.corpo.mensagem, /indispon/);

  await chamar("DELETE", "/interno/usuarios/1", null, { "x-token-interno": "interno-teste" });
  legadoNoAr = true;
  assert.equal((await chamar("POST", "/usuarios/2/seguir", token(1))).status, 204);
  legadoNoAr = false;
  assert.equal((await chamar("GET", "/usuarios/2/seguidores")).status, 503);
  legadoNoAr = true;
});

test("rota inexistente devolve JSON", async () => {
  const r = await chamar("GET", "/nada");
  assert.equal(r.status, 404);
  assert.equal(r.corpo.mensagem, "Rota não encontrada.");
});
