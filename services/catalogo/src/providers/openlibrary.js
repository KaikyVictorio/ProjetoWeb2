
import { getJson } from "../http.js";

function normalizar(valor) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// filtros de conteúdo adulto.
const termosAdultos =
  /\b(nude|nudity|naked|erotic|erotica|erotismo|erotico|porn|pornography|pornographic|pornografia|pornografico|hentai|boudoir|fetish|fetishism|striptease|sexually explicit|adult content|nude photography|erotic poses|sexual poses|sensual photography|pin up)\b/;

function ehAdulto(d) {
  const texto = normalizar(
    [
      d.title,
      ...(d.subject ?? []),
    ].join(" ")
  );

  return termosAdultos.test(texto);
}

function buscaAdulta(q) {
  return termosAdultos.test(normalizar(q));
}

function pontuacao(d, consulta) {
  const titulo = normalizar(d.title);
  const busca = normalizar(consulta);

  let relevancia = 0;

  if (titulo === busca) relevancia = 100;
  else if (titulo.startsWith(busca)) relevancia = 70;
  else if (titulo.includes(busca)) relevancia = 50;
  else relevancia = 10;

  const avaliacoes = Math.log1p(d.ratings_count ?? 0) * 3;
  const media = (d.ratings_average ?? 0) * 2;

  return relevancia + avaliacoes + media;
}

export default {
  categoria: "livro",
  disponivel: () => true,

  async buscar(q) {
    if (buscaAdulta(q)) return [];

    const params = new URLSearchParams({
      q,
      limit: "30",
      fields:
        "key,title,author_name,first_publish_year,cover_i,subject,language,ratings_count,ratings_average",
    });

    const dados = await getJson(
      `https://openlibrary.org/search.json?${params}`
    );

    const resultados = [];
    const vistos = new Set();

    const documentos = (dados.docs ?? [])
      .filter((d) => {
        const idiomas = d.language ?? [];

        const idiomaPermitido = idiomas.some(
          (idioma) => idioma === "por" || idioma === "eng"
        );

        return idiomaPermitido && !ehAdulto(d);
      })
      .sort(
        (a, b) => pontuacao(b, q) - pontuacao(a, q)
      );

    for (const d of documentos) {
      const titulo = d.title ?? "";
      const autor = d.author_name?.[0] ?? "";

      if (!titulo || !d.key) continue;

      // Evita repetir o mesmo título e autor.
      const chave = `${normalizar(titulo)}|${normalizar(autor)}`;

      if (vistos.has(chave)) continue;

      vistos.add(chave);

      resultados.push({
        id: `ol:${d.key.replace("/works/", "")}`,
        titulo,
        ano: d.first_publish_year ?? null,
        categoria: "livro",
        imagem: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
          : "",
        autor,
        generos: (d.subject ?? []).slice(0, 3),
        sinopse: "",
      });
    }

    return resultados;
  },
};
