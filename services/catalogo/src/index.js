import express from "express";

const app = express();
const PORT = process.env.PORT || 4001;

// Dados de teste
const obras = [
  {
    id: "stub-livro-1",
    titulo: "Duna",
    ano: 1965,
    categoria: "livro",
    imagem: "",
    autor: "Frank Herbert",
    generos: ["Ficção científica"],
    sinopse: "Dado de teste.",
  },
  {
    id: "stub-serie-1",
    titulo: "Andor",
    ano: 2022,
    categoria: "serie",
    imagem: "",
    autor: "Tony Gilroy",
    generos: ["Ficção científica", "Drama"],
    sinopse: "Dado de teste.",
  },
  {
    id: "stub-jogo-1",
    titulo: "Hades",
    ano: 2020,
    categoria: "jogo",
    imagem: "",
    autor: "Supergiant Games",
    generos: ["Roguelike"],
    sinopse: "Dado de teste.",
  },
];

const limpar = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

app.get("/health", (_req, res) => {
  res.json({ servico: "catalogo", status: "ok" });
});

// GET /obras?q=&categoria=
app.get("/obras", (req, res) => {
  const q = limpar(String(req.query.q ?? "").trim());
  const categoria = req.query.categoria;

  const resultado = obras.filter(
    (o) =>
      (!categoria || o.categoria === categoria) &&
      (!q || limpar(o.titulo).includes(q))
  );

  res.json(resultado);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[catalogo] rodando na porta ${PORT}`);
});