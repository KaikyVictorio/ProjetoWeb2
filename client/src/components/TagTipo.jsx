const tipos = {
  livro: { rotulo: "livro", cor: "#7a8ae1" },
  jogo: { rotulo: "jogo", cor: "#f1d37f" },
  serie: { rotulo: "série", cor: "#75D9e6" },
};

export default function TagTipo({ tipo, className = "" }) {
  const t = tipos[tipo];
  if (!t) return null;

  return (
    <div
      className={`flex items-center gap-2 border-1 border-neutral-700 bg-white px-2 py-0 font-mono text-[13px] uppercase text-black ${className}`}
    >
      <span
        className="h-2.5 w-2.5 border border-black"
        style={{ background: t.cor }}
      />
      {t.rotulo}
    </div>
  );
}