
import { getJson } from "../http.js";

let cache = [];
let cacheAtualizadoEm = 0;
let carregamento = null;

const CACHE_MS = 15 * 60 * 1000;

function normalizar(valor) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function obterJogos() {
  const agora = Date.now();

  if (cache.length && agora - cacheAtualizadoEm < CACHE_MS) {
    return cache;
  }

  // Evita várias requisições simultâneas à API.
  if (carregamento) return carregamento;

  carregamento = getJson(
    "https://www.freetogame.com/api/games?sort-by=popularity",
    { timeoutMs: 15000 }
  )
    .then((dados) => {
      cache = Array.isArray(dados) ? dados : [];
      cacheAtualizadoEm = Date.now();
      return cache;
    })
    .finally(() => {
      carregamento = null;
    });

  return carregamento;
}

export default {
  categoria: "jogo",
  disponivel: () => true,

  async buscar(q) {
    const termo = normalizar(q);

    if (termo.length < 2) return [];

    const jogos = await obterJogos();

    return jogos
      .filter((jogo) => normalizar(jogo.title).includes(termo))
      .map((jogo, indice) => ({
        id: `ftg:${jogo.id}`,
        titulo: jogo.title,
        ano: jogo.release_date
          ? Number(jogo.release_date.slice(0, 4))
          : null,
        categoria: "jogo",
        imagem: jogo.thumbnail ?? "",
        autor: jogo.developer ?? "",
        generos: jogo.genre ? [jogo.genre] : [],
        sinopse: jogo.short_description ?? "",
        relevancia: normalizar(jogo.title) === termo
          ? 3
          : normalizar(jogo.title).startsWith(termo)
            ? 2
            : 1,
        ordemOriginal: indice,
      }))
      .sort(
        (a, b) =>
          b.relevancia - a.relevancia ||
          a.ordemOriginal - b.ordemOriginal
      )
      .map(({ relevancia, ordemOriginal, ...jogo }) => jogo);
  },
};
