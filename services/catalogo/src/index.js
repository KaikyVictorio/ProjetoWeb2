
import express from "express";

import openlibrary from "./providers/openlibrary.js";
import rawg from "./providers/rawg.js";
import tvmaze from "./providers/tvmaze.js";

const app = express();

const PORT = process.env.PORT || 4001;

const provedores = [openlibrary, tvmaze, rawg];

app.get("/health", (_req, res) => {
  res.json({
    servico: "catalogo",
    status: "ok",
    fontes: Object.fromEntries(
      provedores.map((p) => [p.categoria, p.disponivel()])
    ),
  });
});

// GET /obras?q=&categoria=
app.get("/obras", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const categoria = req.query.categoria;

  if (q.length < 2) {
    return res.json([]);
  }

  const alvo = provedores.filter(
    (p) => p.disponivel() && (!categoria || p.categoria === categoria)
  );

  const resultados = await Promise.allSettled(
    alvo.map((p) => p.buscar(q))
  );

  const obras = [];
  let falhas = 0;

  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") {
      obras.push(...r.value);
    } else {
      falhas++;

      console.error(
        `[catalogo] falha em ${alvo[i].categoria}: ${r.reason.message}`
      );
    }
  });

  if (alvo.length > 0 && falhas === alvo.length) {
    return res.status(502).json({
      erro: "fontes externas indisponíveis",
    });
  }

  res.json(obras);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[catalogo] rodando na porta ${PORT}`);
});
