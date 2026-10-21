export default function CapaItem({ item }) {
  return (
    <div className="rounded-xs group relative aspect-[2/3] w-full overflow-hidden border-2 border-neutral-600 bg-neutral-300">
      {item.imagem && (
        <img
          src={item.imagem}
          alt={`Capa de ${item.titulo}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
        <h3 className="text-lg font-extrabold uppercase leading-none text-white">
          {item.titulo}
        </h3>
        <p className="mt-1 font-mono text-xs text-white">{item.ano}</p>
      </div>
    </div>
  );
}