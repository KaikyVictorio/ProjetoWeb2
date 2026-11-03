import { getJson } from "../http.js";

export default {
  categoria: "livro",
  disponivel: () => true, 

  async buscar(q) {
    const params = new URLSearchParams({
      q,
      limit: "10",
      fields: "key,title,author_name,first_publish_year,cover_i,subject",
    });
    const dados = await getJson(`https://openlibrary.org/search.json?${params}`);

    return (dados.docs ?? []).map((d) => ({
      id: `ol:${d.key.replace("/works/", "")}`,
      titulo: d.title,
      ano: d.first_publish_year ?? null,
      categoria: "livro",
      imagem: d.cover_i
        ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
        : "",
      autor: d.author_name?.[0] ?? "",
      generos: (d.subject ?? []).slice(0, 3),
      sinopse: "",
    }));
  },
};