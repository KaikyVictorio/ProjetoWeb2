import { getJson } from "../http.js";

export default {
  categoria: "jogo",
  disponivel: () => Boolean(process.env.RAWG_API_KEY),

  async buscar(q) {
    const params = new URLSearchParams({
      key: process.env.RAWG_API_KEY,
      search: q,
      page_size: "10",
    });
    const dados = await getJson(`https://api.rawg.io/api/games?${params}`);

    return (dados.results ?? []).map((g) => ({
      id: `rawg:${g.id}`,
      titulo: g.name,
      ano: g.released ? Number(g.released.slice(0, 4)) : null,
      categoria: "jogo",
      imagem: g.background_image ?? "",
      autor: "",
      generos: (g.genres ?? []).map((x) => x.name),
      sinopse: "",
    }));
  },
};