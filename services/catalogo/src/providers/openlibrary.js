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

export default {
  categoria: "livro",
  disponivel: () => true,

  async buscar(q) {
    const params = new URLSearchParams({
      q,
      limit: "30",
      fields: "key,title,author_name,first_publish_year,cover_i,subject,language",
    });

    const dados = await getJson(
      `https://openlibrary.org/search.json?${params}`
    );

    const resultados = [];
    const vistos = new Set();

    for (const d of dados.docs ?? []) {
      // Aceita somente obras com edição em português ou inglês.
      const idiomas = d.language ?? [];
      const idiomaPermitido = idiomas.some(
        (idioma) => idioma === "por" || idioma === "eng"
      );

      if (!idiomaPermitido) continue;

      const titulo = d.title ?? "";
      const autor = d.author_name?.[0] ?? "";

      if (!titulo) continue;

      // Evita repetir o mesmo título e autor, mesmo com capas diferentes.
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
