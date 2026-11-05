// Teste de integração: sobe a API com banco em memória e percorre os CRUDs.
// Rodar com: npm test
process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "teste";

import http from "node:http";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const { app } = await import("../src/index.js");

let servidor;
let base;

before(async () => {
  await new Promise((ok) => {
    servidor = app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(() => {
  servidor.close();
  for (const s of servicosFalsos) s.close();
});

// Serviços falsos de favoritos e wishlist (os de verdade ficam em services/ e têm testes próprios).
// Guardam em `chamadas` o que o monólito pediu, para conferir os avisos de obra/conta apagada.
const servicosFalsos = [];
const chamadas = [];
async function subirServicoFalso(nome, variavelUrl, { tem, recentes }) {
  const s = http.createServer((req, res) => {
    const resposta = (status, corpo) => {
      res.writeHead(status, corpo ? { "Content-Type": "application/json" } : {});
      res.end(corpo ? JSON.stringify(corpo) : undefined);
    };
    if (req.headers["x-token-interno"] !== "token-interno-dev") return resposta(401, {});
    chamadas.push(`${nome} ${req.method} ${req.url}`);
    const [, , rota, a, b] = req.url.split("?")[0].split("/");
    if (req.method === "GET" && rota === "tem") return resposta(200, { tem: tem(Number(a), Number(b)) });
    if (req.method === "GET" && rota === "recentes") return resposta(200, { obraIds: recentes });
    if (req.method === "DELETE") return resposta(204);
    resposta(404, {});
  });
  await new Promise((ok) => s.listen(0, ok));
  servicosFalsos.push(s);
  process.env[variavelUrl] = `http://127.0.0.1:${s.address().port}`;
}

async function api(metodo, caminho, corpo, token) {
  const resposta = await fetch(base + caminho, {
    method: metodo,
    headers: {
      ...(corpo ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await resposta.text();
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null };
}

const estado = {};

test("cadastro valida, cria e bloqueia duplicados", async () => {
  assert.equal((await api("POST", "/auth/cadastro", { nome_usuario: "AB", email: "x", senha: "1" })).status, 400);

  const r = await api("POST", "/auth/cadastro", { nome_usuario: "maria", email: "maria@email.com", senha: "segredo1" });
  assert.equal(r.status, 201);
  assert.ok(r.corpo.token);
  assert.equal(r.corpo.usuario.usuario, "maria");
  assert.equal(r.corpo.usuario.senha_hash, undefined);
  estado.token = r.corpo.token;
  estado.eu = r.corpo.usuario.id;

  const dup = await api("POST", "/auth/cadastro", { nome_usuario: "maria", email: "outro@email.com", senha: "segredo1" });
  assert.equal(dup.status, 409);
  const dupEmail = await api("POST", "/auth/cadastro", { nome_usuario: "maria2", email: "MARIA@email.com", senha: "segredo1" });
  assert.equal(dupEmail.status, 409);
});

test("login certo, errado e /me", async () => {
  assert.equal((await api("POST", "/auth/login", { email: "maria@email.com", senha: "errada" })).status, 401);
  const r = await api("POST", "/auth/login", { email: "maria@email.com", senha: "segredo1" });
  assert.equal(r.status, 200);
  const me = await api("GET", "/auth/me", null, r.corpo.token);
  assert.equal(me.corpo.usuario.email, "maria@email.com");
  assert.equal((await api("GET", "/auth/me")).status, 401);
});

test("seed: login da Ana funciona e há obras", async () => {
  const r = await api("POST", "/auth/login", { email: "ana@email.com", senha: "123456" });
  assert.equal(r.status, 200);
  estado.ana = r.corpo.usuario.id;
  estado.tokenAna = r.corpo.token;
  const obras = await api("GET", "/obras?q=balatro");
  assert.equal(obras.corpo.length, 1);
  assert.equal(obras.corpo[0].categoria, "jogo");
});

test("obras: busca por ids (usada pelos serviços de favoritos e wishlist)", async () => {
  const todas = (await api("GET", "/obras?limite=3")).corpo;
  const ids = todas.map((o) => o.id);
  const porIds = await api("GET", `/obras?ids=${ids.join(",")},99999,abc,${ids[0]}`);
  assert.deepEqual(porIds.corpo.map((o) => o.id).sort((a, b) => a - b), [...ids].sort((a, b) => a - b));
  assert.ok(["livro", "serie", "jogo"].includes(porIds.corpo[0].categoria));
  assert.deepEqual((await api("GET", "/obras?ids=abc")).corpo, []);
});

test("obras: CRUD com permissão de dono", async () => {
  assert.equal((await api("POST", "/obras", { titulo: "X", categoria: "jogo" })).status, 401);
  assert.equal((await api("POST", "/obras", { titulo: "", categoria: "jogo" }, estado.token)).status, 400);
  assert.equal((await api("POST", "/obras", { titulo: "X", categoria: "filme" }, estado.token)).status, 400);

  const criada = await api("POST", "/obras", {
    titulo: "Minha Obra", categoria: "livro", ano: 2020, autor: "Eu", generos: ["Teste"], sinopse: "Sinopse",
  }, estado.token);
  assert.equal(criada.status, 201);
  estado.obra = criada.corpo.id;
  assert.equal(criada.corpo.criadoPor, estado.eu);

  const lida = await api("GET", `/obras/${estado.obra}`, null, estado.token);
  assert.equal(lida.corpo.titulo, "Minha Obra");
  assert.deepEqual(lida.corpo.minha, { nota: 0, favorito: false, wishlist: false });

  assert.equal((await api("PUT", `/obras/${estado.obra}`, { titulo: "Hack", categoria: "livro" }, estado.tokenAna)).status, 403);
  const editada = await api("PUT", `/obras/${estado.obra}`, { titulo: "Obra Editada", categoria: "livro", ano: 2021 }, estado.token);
  assert.equal(editada.corpo.titulo, "Obra Editada");

  assert.equal((await api("GET", "/obras/99999")).status, 404);
});

test("nota da obra: define, calcula média e remove", async () => {
  const r = await api("PUT", `/obras/${estado.obra}/nota`, { nota: 4.5 }, estado.token);
  assert.equal(r.corpo.media, 4.5);
  await api("PUT", `/obras/${estado.obra}/nota`, { nota: 3.5 }, estado.tokenAna);
  const media = await api("GET", `/obras/${estado.obra}`);
  assert.equal(media.corpo.media, 4);
  assert.equal(media.corpo.totalNotas, 2);
  assert.equal((await api("PUT", `/obras/${estado.obra}/nota`, { nota: 4.3 }, estado.token)).status, 400);
  assert.equal((await api("PUT", `/obras/${estado.obra}/nota`, { nota: 0 }, estado.tokenAna)).corpo.totalNotas, 1);
});

test("logs: criar, listar reviews, editar, excluir", async () => {
  const criado = await api("POST", "/logs", {
    obraId: estado.obra, nota: 5, texto: "Muito bom", spoiler: true, data: "2026-03-10",
  }, estado.token);
  assert.equal(criado.status, 201);
  assert.equal(criado.corpo.tipo, "review");
  assert.equal(criado.corpo.usuario, "maria");
  estado.log = criado.corpo.id;

  const semTexto = await api("POST", "/logs", { obraId: estado.obra, nota: 4 }, estado.token);
  assert.equal(semTexto.corpo.tipo, "terminou");

  const reviews = await api("GET", `/obras/${estado.obra}/reviews`);
  assert.equal(reviews.corpo.total, 1);
  assert.equal(reviews.corpo.itens[0].spoiler, true);

  const feedPerfil = await api("GET", `/usuarios/${estado.eu}/logs`);
  assert.equal(feedPerfil.corpo.length, 2);
  const soReviews = await api("GET", `/usuarios/${estado.eu}/logs?apenasReviews=1`);
  assert.equal(soReviews.corpo.length, 1);

  assert.equal((await api("PUT", `/logs/${estado.log}`, { texto: "hack" }, estado.tokenAna)).status, 403);
  const editado = await api("PUT", `/logs/${estado.log}`, { nota: 3, texto: "Mudei de ideia" }, estado.token);
  assert.equal(editado.corpo.texto, "Mudei de ideia");
  assert.equal(editado.corpo.nota, 3);
  assert.equal(editado.corpo.data, "2026-03-10");

  assert.equal((await api("POST", "/logs", { obraId: 99999 }, estado.token)).status, 404);
  assert.equal((await api("POST", "/logs", { obraId: estado.obra, nota: 9 }, estado.token)).status, 400);

  assert.equal((await api("DELETE", `/logs/${semTexto.corpo.id}`, null, estado.token)).status, 204);
  assert.equal((await api("DELETE", `/logs/${semTexto.corpo.id}`, null, estado.token)).status, 404);
});

test("rotação: adicionar, limite e remover", async () => {
  const add = (obraId) => api("POST", "/me/rotacao", { obraId }, estado.token);
  const jogos = (await api("GET", "/obras?categoria=jogo")).corpo;

  assert.equal((await add(jogos[0].id)).status, 201);
  assert.equal((await add(jogos[0].id)).status, 201); // idempotente
  assert.equal((await add(99999)).status, 404);

  // limite de 4 na rotação
  for (const j of jogos.slice(1, 4)) assert.equal((await add(j.id)).status, 201);
  const estourou = await add(jogos[4].id);
  assert.equal(estourou.status, 400);
  assert.match(estourou.corpo.mensagem, /4/);
  const resumo = await api("GET", `/usuarios/${estado.eu}/resumo`);
  assert.equal(resumo.corpo.rotacao.jogando.length, 4);

  assert.equal((await api("DELETE", `/me/rotacao/${jogos[0].id}`, null, estado.token)).status, 204);
  assert.equal((await api("POST", "/me/rotacao", { obraId: 1 })).status, 401);

  // favoritos e wishlist agora são dos microsserviços: o monólito não atende mais essas rotas
  assert.equal((await api("POST", "/me/favoritos", { obraId: jogos[0].id }, estado.token)).status, 404);
  assert.equal((await api("GET", `/usuarios/${estado.eu}/wishlist`)).status, 404);
});

test("listas: CRUD e permissão", async () => {
  const jogos = (await api("GET", "/obras?categoria=jogo")).corpo;
  assert.equal((await api("POST", "/listas", { titulo: "" }, estado.token)).status, 400);

  const criada = await api("POST", "/listas", {
    titulo: "Minha lista", descricao: "desc", obraIds: [jogos[0].id, jogos[1].id, jogos[0].id, 99999],
  }, estado.token);
  assert.equal(criada.status, 201);
  assert.deepEqual(criada.corpo.obraIds, [jogos[0].id, jogos[1].id]);
  estado.lista = criada.corpo.id;

  const lida = await api("GET", `/listas/${estado.lista}`);
  assert.equal(lida.corpo.obras.length, 2);
  assert.equal(lida.corpo.autor.usuario, "maria");

  const dela = await api("GET", `/listas?usuario=${estado.eu}`);
  assert.equal(dela.corpo.length, 1);
  assert.ok((await api("GET", "/listas")).corpo.length >= 2);

  assert.equal((await api("PUT", `/listas/${estado.lista}`, { titulo: "hack" }, estado.tokenAna)).status, 403);
  const editada = await api("PUT", `/listas/${estado.lista}`, { titulo: "Renomeada", descricao: "", obraIds: [jogos[2].id] }, estado.token);
  assert.equal(editada.corpo.titulo, "Renomeada");
  assert.deepEqual(editada.corpo.obraIds, [jogos[2].id]);

  assert.equal((await api("DELETE", `/listas/${estado.lista}`, null, estado.tokenAna)).status, 403);
  assert.equal((await api("DELETE", `/listas/${estado.lista}`, null, estado.token)).status, 204);
  assert.equal((await api("GET", `/listas/${estado.lista}`)).status, 404);
});

test("usuários: busca, perfil, ids, editar e resumo da Ana", async () => {
  const busca = await api("GET", "/usuarios?q=souza");
  assert.equal(busca.corpo.length, 1);

  // seguidores/seguindo/euSigo vêm do serviço social; sem ele o perfil abre com zeros
  const perfil = await api("GET", `/usuarios/${estado.ana}`, null, estado.token);
  assert.equal(perfil.status, 200);
  assert.equal(perfil.corpo.seguidores, 0);
  assert.equal(perfil.corpo.euSigo, false);
  assert.equal(perfil.corpo.email, undefined);

  // busca por ids (usada pelo serviço social)
  const porIds = await api("GET", `/usuarios?ids=${estado.ana},${estado.eu},99999,abc`);
  assert.deepEqual(porIds.corpo.map((u) => u.id).sort(), [estado.ana, estado.eu].sort());
  assert.equal(porIds.corpo[0].email, undefined);
  assert.deepEqual((await api("GET", "/usuarios?ids=abc")).corpo, []);

  // rota interna exige o token entre serviços
  assert.equal((await api("GET", "/interno/seguidores")).status, 401);
  const interno = await fetch(`${base}/interno/seguidores`, { headers: { "x-token-interno": "token-interno-dev" } });
  assert.equal(interno.status, 200);
  assert.equal((await interno.json()).length, 5);

  // exportações para a importação inicial dos serviços de favoritos e wishlist (dados do seed da Ana)
  assert.equal((await api("GET", "/interno/favoritos")).status, 401);
  assert.equal((await api("GET", "/interno/wishlist")).status, 401);
  const cabecalho = { headers: { "x-token-interno": "token-interno-dev" } };
  const favs = await (await fetch(`${base}/interno/favoritos`, cabecalho)).json();
  assert.equal(favs.length, 8);
  assert.deepEqual(Object.keys(favs[0]).sort(), ["criado_em", "obra_id", "usuario_id"]);
  assert.ok(favs.every((f) => f.usuario_id === estado.ana));
  assert.equal((await (await fetch(`${base}/interno/wishlist`, cabecalho)).json()).length, 3);

  const edit = await api("PUT", "/usuarios/me", {
    nome: "Maria Souza", bio: "oi", foto: "", infos: [{ rotulo: "idade", valor: "22" }, { rotulo: "", valor: "x" }],
  }, estado.token);
  assert.equal(edit.corpo.usuario.nome, "Maria Souza");
  assert.equal(edit.corpo.usuario.infos.length, 1);

  const resumo = await api("GET", `/usuarios/${estado.ana}/resumo`);
  assert.equal(resumo.corpo.rotacao.assistindo.length, 4);
  assert.equal(resumo.corpo.atividade.length, 3);
  assert.deepEqual(resumo.corpo.fila, []); // serviço de wishlist fora do ar: fila vazia, o resto abre
  assert.equal(resumo.corpo.estatisticas.length, 3);
  assert.ok(resumo.corpo.estatisticas.every((e) => e.total >= e.ano));

  const acervo = await api("GET", `/usuarios/${estado.ana}/acervo`);
  assert.equal(acervo.corpo.length, 8);
  assert.equal((await api("GET", "/usuarios/99999")).status, 404);
});

test("feed da comunidade", async () => {
  const feed = await api("GET", "/logs/feed?limite=5");
  assert.equal(feed.corpo.length, 5);
});

test("integração com os serviços de favoritos e wishlist", async () => {
  const jogos = (await api("GET", "/obras?categoria=jogo")).corpo;
  const [primeiro, segundo, apagada] = [jogos[0].id, jogos[1].id, 99999];
  // a fila vem do serviço: ids na ordem em que ele devolve; obra que não existe mais é descartada
  await subirServicoFalso("favoritos", "FAVORITOS_URL", { tem: (u, o) => u === estado.eu && o === estado.obra, recentes: [] });
  await subirServicoFalso("wishlist", "WISHLIST_URL", {
    tem: (u, o) => u === estado.eu && o === estado.obra,
    recentes: [segundo, apagada, primeiro],
  });

  const obra = await api("GET", `/obras/${estado.obra}`, null, estado.token);
  assert.deepEqual([obra.corpo.minha.favorito, obra.corpo.minha.wishlist], [true, true]);
  assert.equal(typeof obra.corpo.minha.nota, "number"); // a nota continua vindo do próprio monólito
  const outra = await api("GET", `/obras/${primeiro}`, null, estado.token);
  assert.deepEqual([outra.corpo.minha.favorito, outra.corpo.minha.wishlist], [false, false]);
  assert.equal((await api("GET", `/obras/${estado.obra}`)).corpo.minha, undefined); // anônimo não tem "minha"

  const resumo = await api("GET", `/usuarios/${estado.eu}/resumo`);
  assert.deepEqual(resumo.corpo.fila.map((o) => o.id), [segundo, primeiro]);
  assert.deepEqual(Object.keys(resumo.corpo.fila[0]).sort(), ["ano", "categoria", "id", "imagem", "titulo"]);
});

test("excluir obra e conta apagam os dados ligados a elas", async () => {
  chamadas.length = 0;
  assert.equal((await api("DELETE", `/obras/${estado.obra}`, null, estado.tokenAna)).status, 403);
  assert.equal((await api("DELETE", `/obras/${estado.obra}`, null, estado.token)).status, 204);
  assert.equal((await api("GET", `/obras/${estado.obra}`)).status, 404);

  assert.equal((await api("DELETE", "/usuarios/me", null, estado.token)).status, 204);
  assert.equal((await api("GET", `/usuarios/${estado.eu}`)).status, 404);
  assert.equal((await api("GET", "/auth/me", null, estado.token)).status, 401);

  // os serviços são avisados (em segundo plano), cada um do que é seu
  await new Promise((ok) => setTimeout(ok, 100));
  for (const nome of ["favoritos", "wishlist"]) {
    assert.ok(chamadas.includes(`${nome} DELETE /interno/obras/${estado.obra}`), `${nome}: aviso de obra apagada`);
    assert.ok(chamadas.includes(`${nome} DELETE /interno/usuarios/${estado.eu}`), `${nome}: aviso de conta apagada`);
  }
});

test("JSON inválido e rota inexistente", async () => {
  const r = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{ruim" });
  assert.equal(r.status, 400);
  assert.equal((await api("GET", "/nao-existe")).status, 404);
});
