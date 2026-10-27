export const MAX_FAVORITOS = 5;
export const MAX_ROTACAO = 4;

// Rotação atual: cada "ação" corresponde a uma categoria de obra
export const ordemRotacao = ["lendo", "jogando", "assistindo"];
export const rotacaoInfo = {
  lendo: { rotulo: "Está lendo", tipo: "livro" },
  jogando: { rotulo: "Está jogando", tipo: "jogo" },
  assistindo: { rotulo: "Está assistindo", tipo: "serie" },
};

export const tituloFavoritos = {
  livro: "Livros favoritos",
  serie: "Séries favoritas",
  jogo: "Jogos favoritos",
};

export const categoriasWishlist = [
  { slug: "livros", tipo: "livro", titulo: "Quer ler", cor: "#7A81E1" },
  { slug: "series", tipo: "serie", titulo: "Quer assistir", cor: "#f1d37f" },
  { slug: "jogos", tipo: "jogo", titulo: "Quer jogar", cor: "#75D9E6" },
];

export const nomeCategoria = { livro: "livro", serie: "série", jogo: "jogo" };
