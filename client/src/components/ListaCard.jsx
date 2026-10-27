import { Link } from "react-router-dom";

export default function ListaCard({ lista }) {
  const obras = lista.obras.slice(0, 5);

  return (
    <article className="text-left">
      <Link to={`/listas/${lista.id}`} className="group block">
        <div className="flex">
          {obras.length === 0 ? (
            <div className="aspect-[2/3] w-[32%] border-2 border-neutral-800 bg-neutral-300" />
          ) : (
            obras.map((o, i) => (
              <div
                key={o.id}
                className="relative aspect-[2/3] w-[32%] shrink-0 overflow-hidden border-2 border-neutral-800 bg-neutral-300 shadow-[2px_0_0_0_rgba(0,0,0,0.25)]"
                style={{ marginLeft: i === 0 ? 0 : "-15%", zIndex: 5 - i }}
              >
                {o.imagem && (
                  <img src={o.imagem} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))
          )}
        </div>

        <p className="mt-3 font-mono text-lg font-bold leading-tight group-hover:underline">
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
        Criado por{" "}
        <Link to={`/usuarios/${lista.autor.id}`} className="font-bold text-black hover:underline">
          @{lista.autor.usuario}
        </Link>
      </p>
    </article>
  );
}