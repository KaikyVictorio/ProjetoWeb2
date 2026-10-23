function Estrelas({ nota }) {
  return (
    <span className="whitespace-nowrap text-xl leading-none text-yellow-600">
      {"★".repeat(Math.floor(nota))}
      {nota % 1 !== 0 && "½"}
    </span>
  );
}

const acoes = {
  lendo: "está lendo",
  assistindo: "está assistindo",
  jogando: "está jogando",
};

export default function ItemFeed({ item }) {
  if (item.tipo === "review") {
    return (
      <li className="flex gap-4 py-5">
        <div className="h-32 w-22 shrink-0 overflow-hidden border-2 border-neutral-800 bg-neutral-300">
          {item.obra.imagem && (
            <img
              src={item.obra.imagem}
              alt={`Capa de ${item.obra.titulo}`}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="font-mono font-bold">
            {item.obra.titulo}{" "}
            <span className="font-normal text-neutral-600">{item.obra.ano}</span>
          </p>
          {item.nota > 0 && <Estrelas nota={item.nota} />}
          <p className="mt-2 text-sm leading-relaxed text-neutral-800">{item.texto}</p>
          <p className="mt-2 font-mono text-sm text-neutral-700">{item.data}</p>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 py-6">
      <p className="min-w-0 text-sm">
        <span className="font-bold">@{item.usuario}</span>{" "}
        {item.tipo === "terminou" ? "terminou" : acoes[item.acao]}{" "}
        <span className="font-bold">{item.obra.titulo}</span>
      </p>

      <div className="flex shrink-0 items-center gap-3">
        {item.tipo === "terminou" && item.nota > 0 && <Estrelas nota={item.nota} />}
        <span className="font-mono text-sm text-neutral-700">{item.data}</span>
      </div>
    </li>
  );
}