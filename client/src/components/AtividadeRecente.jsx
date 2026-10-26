import TagTipo from "./TagTipo";
import { atividade } from "../data/atividade";

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

export default function AtividadeRecente() {
  return (
    <ul>
      {atividade.slice(0, 3).map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-4 border-b border-dashed border-neutral-400 py-3 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span className="w-10 shrink-0 font-mono text-sm">{item.data}</span>

          <div className="rounded-xs h-26 w-18 shrink-0 overflow-hidden border-2 border-neutral-600 bg-neutral-300">
            {item.imagem && (
              <img
                src={item.imagem}
                alt={`Capa de ${item.titulo}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-mono font-bold text-left">
              {item.titulo}{" "}
              <span className="font-normal text-neutral-500">{item.ano}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TagTipo tipo={item.tipo} />
              {item.status && (
                <span className="rounded-full border-1 border-neutral-800 bg-yellow-300 px-2 py-1 font-mono text-xs text-black">
                  {item.status}
                </span>
              )}
            </div>
          </div>

          {item.nota > 0 && <Estrelas nota={item.nota} />}
        </li>
      ))}
    </ul>
  );
}