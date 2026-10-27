import { Link } from "react-router-dom";
import TagTipo from "./TagTipo";
import { formatarData } from "../utils/data";

const revisto = { livro: "relido", serie: "reassistido", jogo: "rejogado" };

function Estrelas({ nota }) {
  const cheias = Math.floor(nota);
  const meia = nota % 1 !== 0;

  return (
    <span
      className="whitespace-nowrap text-[23px] leading-none text-[#EAC45B]"
      aria-label={`${nota} de 5 estrelas`}
    >
      {"★".repeat(cheias)}
      {meia && "½"}
    </span>
  );
}

// `itens` são logs (vindos de /usuarios/:id/resumo)
export default function AtividadeRecente({ itens }) {
  if (itens.length === 0) {
    return <p className="text-left text-sm text-slate-400">Nenhuma atividade ainda.</p>;
  }

  return (
    <ul>
      {itens.slice(0, 3).map((item) => {
        const status = item.texto ? "review" : item.jaFeito ? revisto[item.obra.categoria] : null;

        return (
          <li
            key={item.id}
            className="flex items-center gap-4 border-b border-dashed border-neutral-400 py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <span className="w-10 shrink-0 font-mono text-sm">{formatarData(item.data)}</span>

            <div className="rounded-xs h-26 w-18 shrink-0 overflow-hidden border-2 border-neutral-600 bg-neutral-300">
              {item.obra.imagem && (
                <img
                  src={item.obra.imagem}
                  alt={`Capa de ${item.obra.titulo}`}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-mono font-bold text-left">
                <Link to={`/obras/${item.obra.id}`} className="hover:underline">
                  {item.obra.titulo}
                </Link>{" "}
                <span className="font-normal text-neutral-500">{item.obra.ano}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TagTipo tipo={item.obra.categoria} />
                {status && (
                  <span className="rounded-full border-1 border-neutral-800 bg-yellow-300 px-2 py-1 font-mono text-xs text-black">
                    {status}
                  </span>
                )}
              </div>
            </div>

            {item.nota > 0 && <Estrelas nota={item.nota} />}
          </li>
        );
      })}
    </ul>
  );
}
