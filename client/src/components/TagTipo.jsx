export const tipos = {
  livro: { rotulo: "livro", cor: "#dc2626" },
  jogo: { rotulo: "jogo", cor: "#16a34a" },
  serie: { rotulo: "série", cor: "#2563eb" },
};

export default function TagTipo({ tipo, className = "" }) {
  const t = tipos[tipo];
  if (!t) return null;

  return (
    <div
      className={`flex items-center gap-2 border-2 border-neutral-700 bg-white px-2 py-1 font-mono text-xs uppercase text-black ${className}`}
    >
      <span
        className="h-2.5 w-2.5 border border-black"
        style={{ background: t.cor }}
      />
      {t.rotulo}
    </div>
  );
}