export default function FiltroBotao({ ativo, cor, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      style={ativo ? { backgroundColor: cor } : undefined}
      className={`relative rounded-xl border border-black px-3 py-1 font-mono text-[15px] font-bold uppercase tracking-wide text-black transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] ${
        ativo ? "" : "bg-white"
      }`}
    >
      {children}

      {ativo && (
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full border border-black bg-white text-[10px] font-bold leading-none"
        >
          ×
        </span>
      )}
    </button>
  );
}