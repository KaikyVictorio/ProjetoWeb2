// Teste de integração: sobe a API com banco em memória e percorre os CRUDs.
// Rodar com: npm test
process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "teste";

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
after(() => servidor.close());

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

test("favoritos, wishlist e rotação: adicionar, limite e remover", async () => {
  const add = (rota, obraId) => api("POST", `/me/${rota}`, { obraId }, estado.token);

  assert.equal((await add("favoritos", estado.obra)).status, 201);
  assert.equal((await add("favoritos", estado.obra)).status, 201); // idempotente
  const fav = await api("GET", `/usuarios/${estado.eu}/favoritos`);
  assert.equal(fav.corpo.livro.length, 1);
  assert.equal((await api("GET", `/obras/${estado.obra}`, null, estado.token)).corpo.minha.favorito, true);

  // limite de 5 favoritos por categoria
  const jogos = (await api("GET", "/obras?categoria=jogo")).corpo;
  for (const j of jogos.slice(0, 5)) assert.equal((await add("favoritos", j.id)).status, 201);
  const estourou = await add("favoritos", jogos[5].id);
  assert.equal(estourou.status, 400);
  assert.match(estourou.corpo.mensagem, /5/);

  assert.equal((await add("wishlist", jogos[0].id)).status, 201);
  const wish = await api("GET", `/usuarios/${estado.eu}/wishlist`);
  assert.equal(wish.corpo.jogo.length, 1);

  // limite de 4 na rotação
  for (const j of jogos.slice(0, 4)) assert.equal((await add("rotacao", j.id)).status, 201);
  assert.equal((await add("rotacao", jogos[4].id)).status, 400);
  const resumo = await api("GET", `/usuarios/${estado.eu}/resumo`);
  assert.equal(resumo.corpo.rotacao.jogando.length, 4);

  assert.equal((await api("DELETE", `/me/favoritos/${estado.obra}`, null, estado.token)).status, 204);
  assert.equal((await api("GET", `/usuarios/${estado.eu}/favoritos`)).corpo.livro.length, 0);
  assert.equal((await api("DELETE", `/me/rotacao/${jogos[0].id}`, null, estado.token)).status, 204);
  assert.equal((await api("POST", "/me/favoritos", { obraId: 1 })).status, 401);
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

test("usuários: busca, perfil, seguir, editar e resumo da Ana", async () => {
  const busca = await api("GET", "/usuarios?q=souza");
  assert.equal(busca.corpo.length, 1);

  const perfil = await api("GET", `/usuarios/${estado.ana}`, null, estado.token);
  assert.equal(perfil.corpo.seguidores, 3);
  assert.equal(perfil.corpo.euSigo, false);
  assert.equal(perfil.corpo.email, undefined);

  assert.equal((await api("POST", `/usuarios/${estado.ana}/seguir`, null, estado.token)).status, 204);
  assert.equal((await api("GET", `/usuarios/${estado.ana}`, null, estado.token)).corpo.euSigo, true);
  assert.equal((await api("DELETE", `/usuarios/${estado.ana}/seguir`, null, estado.token)).status, 204);
  assert.equal((await api("POST", `/usuarios/${estado.eu}/seguir`, null, estado.token)).status, 400);

  const edit = await api("PUT", "/usuarios/me", {
    nome: "Maria Souza", bio: "oi", foto: "", infos: [{ rotulo: "idade", valor: "22" }, { rotulo: "", valor: "x" }],
  }, estado.token);
  assert.equal(edit.corpo.usuario.nome, "Maria Souza");
  assert.equal(edit.corpo.usuario.infos.length, 1);

  const resumo = await api("GET", `/usuarios/${estado.ana}/resumo`);
  assert.equal(resumo.corpo.rotacao.assistindo.length, 4);
  assert.equal(resumo.corpo.atividade.length, 3);
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

test("excluir obra e conta apagam os dados ligados a elas", async () => {
  assert.equal((await api("DELETE", `/obras/${estado.obra}`, null, estado.tokenAna)).status, 403);
  assert.equal((await api("DELETE", `/obras/${estado.obra}`, null, estado.token)).status, 204);
  assert.equal((await api("GET", `/obras/${estado.obra}`)).status, 404);

  assert.equal((await api("DELETE", "/usuarios/me", null, estado.token)).status, 204);
  assert.equal((await api("GET", `/usuarios/${estado.eu}`)).status, 404);
  assert.equal((await api("GET", "/auth/me", null, estado.token)).status, 401);
});

test("JSON inválido e rota inexistente", async () => {
  const r = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{ruim" });
  assert.equal(r.status, 400);
  assert.equal((await api("GET", "/nao-existe")).status, 404);
});
