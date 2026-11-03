
import { getJson } from "../http.js";

export default {
  categoria: "serie",

  disponivel: () => true,

  async buscar(q) {
    const params = new URLSearchParams({ q });

    const dados = await getJson(
      `https://api.tvmaze.com/search/shows?${params}`
    );

    return dados.map(({ show }) => ({
      id: `tvmaze:${show.id}`,
      titulo: show.name,
      ano: show.premiered
        ? Number(show.premiered.slice(0, 4))
        : null,
      categoria: "serie",
      imagem: show.image?.medium ?? "",
      autor: "",
      generos: show.genres ?? [],
      sinopse: show.summary
        ? show.summary.replace(/<[^>]*>/g, "").trim()
        : "",
    }));
  },
};
