import { Link } from "react-router-dom";

// Capa de uma obra. Clicar leva à página da obra.
// Se `onRemover` for passado, mostra um "×" para tirar a obra da coleção.
export default function CapaItem({ item, className = "aspect-[2/3]", posicao, onRemover }) {
  return (
    <div
      className={`rounded-xs group relative w-full overflow-hidden border-2 border-neutral-600 bg-neutral-300 ${className}`}
    >
      {posicao && (
        <span className="absolute left-1 top-1 z-10 rounded-md border-2 border-black bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-black shadow-[2px_2px_0_0_#000]">
          {posicao}º
        </span>
      )}

      {item.imagem && (
        <img
          src={item.imagem}
          alt={`Capa de ${item.titulo}`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      <Link
        to={`/obras/${item.id}`}
        className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 focus-visible:opacity-100"
      >
        <h3 className="text-sm font-extrabold uppercase leading-none text-white">{item.titulo}</h3>
        <p className="mt-1 font-mono text-xs text-white">{item.ano}</p>
      </Link>

      {onRemover && (
        <button
          type="button"
          onClick={onRemover}
          aria-label={`Remover ${item.titulo}`}
          title="Remover"
          className="absolute right-1 top-1 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-white font-mono text-sm font-bold leading-none text-black opacity-100 shadow-[1px_1px_0_0_#000] transition hover:bg-red-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
