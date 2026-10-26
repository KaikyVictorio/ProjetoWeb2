export default function Paginacao({ pagina, total, onChange, cor = "#fde047" }) {
  if (total <= 1) return null;

  const btn =
    "grid h-8 min-w-8 place-items-center rounded-lg border border-black px-2 font-mono text-sm transition";

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={pagina === 1}
        onClick={() => onChange(pagina - 1)}
        aria-label="Página anterior"
        className={`${btn} bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white`}
      >
        ‹
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === pagina ? "page" : undefined}
          style={n === pagina ? { backgroundColor: cor } : undefined}
          className={`${btn} ${n === pagina ? "font-bold" : "bg-white hover:bg-neutral-100"}`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        disabled={pagina === total}
        onClick={() => onChange(pagina + 1)}
        aria-label="Próxima página"
        className={`${btn} bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white`}
      >
        ›
      </button>
    </nav>
  );
}