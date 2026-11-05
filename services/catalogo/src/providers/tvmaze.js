
import { getJson } from "../http.js";

const termosAdultos =
  /\b(erotica|erotic|pornography|pornographic|hentai|adult content|explicit sexual content)\b/i;

function ehAdulto(show) {
  const generos = (show.genres ?? []).join(" ");
  const texto = `${show.name ?? ""} ${show.summary ?? ""} ${generos}`;

  return (
    /\b(adult|erotica|pornography|hentai)\b/i.test(generos) ||
    termosAdultos.test(texto)
  );
}

export default {
  categoria: "serie",

  disponivel: () => true,

  async buscar(q) {
    const params = new URLSearchParams({ q });

    const dados = await getJson(
      `https://api.tvmaze.com/search/shows?${params}`
    );

    return dados
      .filter(({ show }) => !ehAdulto(show))
      .sort((a, b) => {
        const relevancia = (b.score ?? 0) - (a.score ?? 0);

        if (relevancia !== 0) return relevancia;

        return (
          (b.show.rating?.average ?? 0) -
          (a.show.rating?.average ?? 0)
        );
      })
      .map(({ show }) => ({
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
