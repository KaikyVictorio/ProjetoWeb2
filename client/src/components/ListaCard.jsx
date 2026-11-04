import { Link } from "react-router-dom";

const SOBREPOSICAO = 30;

export default function ListaCard({ lista }) {
  const obras = lista.obras.slice(0, 5);
  const larguraCapa = `calc((100% + ${SOBREPOSICAO * 4}px) / 5)`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[18px] border-[1px] border-neutral-300 bg-white text-left shadow-[1px_1px_0_#555] ">
      <div className="flex items-center gap-1.5 border-b-[1px] border-neutral-200 bg-[#f1f2f6] px-4 py-2.5" aria-hidden="true">
        <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-neutral-900 bg-[#FFC800]" />
        <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-neutral-900 bg-[#7a7fe0]" />
        <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-neutral-900 bg-[#5ED9C9]" />
      </div>

      <Link
        to={`/listas/${lista.id}`}
        aria-label={lista.titulo}
        className="block  px-[18px] pb-[18px] pt-5"
      >
        <div className="flex">
          {obras.length === 0 ? (
            <div
              className="aspect-[2/3] shrink-0 rounded-lg border-[1.5px] border-neutral-900 bg-neutral-300 shadow-[2px_2px_0_#111]"
              style={{ width: larguraCapa }}
            />
          ) : (
            obras.map((o, i) => (
              <div
                key={o.id}
                className="relative aspect-[2/3] shrink-0 overflow-hidden rounded-lg border-[1px] border-neutral-400 bg-neutral-300 shadow-[2px_2px_0_#333]"
                style={{ width: larguraCapa, marginLeft: i === 0 ? 0 : -SOBREPOSICAO }}
              >
                {o.imagem && (
                  <img src={o.imagem} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-[18px] pb-[18px] pt-4">
        <Link to={`/listas/${lista.id}`}>
          <h3 className="font-menu text-2xl font-extrabold leading-[1.1] tracking-tight group-hover:underline">
            {lista.titulo}
          </h3>
        </Link>

        {lista.descricao && (
          <p className="font-mono text-sm leading-relaxed">{lista.descricao}</p>
        )}

        <div className="mt-auto flex items-center gap-2.5 border-t-[1.5px] border-dashed border-[#c3c9d6] pt-3">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full border-[1.5px] border-neutral-900 bg-[#FFC800] font-mono text-sm font-bold text-neutral-900">
            {lista.autor.foto ? (
              <img src={lista.autor.foto} alt="" className="h-full w-full object-cover" />
            ) : (
              lista.autor.usuario[0].toUpperCase()
            )}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
              criada por
            </div>
            <Link
              to={`/usuarios/${lista.autor.id}`}
              className="block truncate font-mono text-[13px] font-bold text-black hover:underline"
            >
              @{lista.autor.usuario}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}