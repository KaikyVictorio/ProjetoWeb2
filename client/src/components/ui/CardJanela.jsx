// Card no estilo "janela" das referências (três bolinhas + título no topo).
// Reutilizável em outras telas: Rotação atual, Atividade recente, Estatísticas...
export default function CardJanela({ id, titulo, acaoTopo, children, className = "" }) {
  return (
    <section id={id} className={`card-retro overflow-hidden ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b-2 border-neutral-200 bg-neutral-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-3 rounded-full border border-tinta bg-serie" />
            <span className="size-3 rounded-full border border-tinta bg-livro" />
            <span className="size-3 rounded-full border border-tinta bg-jogo" />
          </span>
          <h2 className="m-0! text-xs! font-bold! uppercase tracking-widest!">{titulo}</h2>
        </div>
        {acaoTopo}
      </header>

      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}
