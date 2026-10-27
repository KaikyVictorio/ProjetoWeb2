import { Link } from "react-router-dom";
import { catalogo } from "../data/catalogo";

export default function ListaCard({ lista }) {
  const obras = lista.obraIds
    .map((id) => catalogo.find((o) => o.id === id))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <article className="text-left">
      <Link to={`/listas/${lista.id}`} className="group block">
        <div className="flex">
          {obras.length === 0 ? (
            <div className="aspect-[2/3] w-[32%] border-1 rounded-lg border-neutral-800 bg-neutral-300" />
          ) : (
            obras.map((o, i) => (
              <div
                key={o.id}
                className="relative aspect-[2/3] w-[35%] shrink-0 overflow-hidden border-1 rounded-lg border-neutral-800 bg-neutral-300 shadow-[2px_0_0_0_rgba(0,0,0,0.25)]"
                style={{ marginLeft: i === 0 ? 0 : "-15%", zIndex: 5 - i }}
              >
                {o.imagem && (
                  <img src={o.imagem} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))
          )}
        </div>

        <p className="mt-3 font-menu text-lg font-bold leading-tight group-hover:underline">
          {lista.titulo}
        </p>
      </Link>

      <p className="mt-2 flex items-center gap-2 font-mono text-sm text-neutral-600">
        <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-500 bg-slate-700 text-xs text-slate-200">
          {lista.autor.foto ? (
            <img src={lista.autor.foto} alt="" className="h-full w-full object-cover" />
          ) : (
            lista.autor.usuario[0].toUpperCase()
          )}
        </span>
        Criado por <strong className="text-black">@{lista.autor.usuario}</strong>
      </p>
    </article>
  );
}