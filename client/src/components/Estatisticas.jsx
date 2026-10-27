export default function Estatisticas({ estatisticas }) {
  const totalAno = estatisticas.reduce((soma, e) => soma + e.ano, 0);

  return (
    <div>
        <div className="grid grid-cols-3 gap-2">
        {estatisticas.map((e) => (
          <div
            key={e.nome}
            className="border-1 rounded border-neutral-800 bg-white py-2 text-center text-black shadow-[2px_2px_0_0_#000]"
            style={{ borderTopWidth: 8, borderTopColor: e.cor }}
          >
            <p className="text-2xl font-extrabold leading-none">{e.total}</p>
            <p className="mt-1 font-mono text-xs">{e.nome}</p>
          </div>
        ))}
      </div>

      <div className="my-4 border-t-2 border-dashed border-neutral-400" />

          <p className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold leading-none">{totalAno}</span>
        <span className="font-mono text-xs text-neutral-500">logs este ano</span>
      </p>

      <div className="mt-4 flex h-5 overflow-hidden border-2 border-neutral-800">
        {estatisticas.map((e) => (
          <div
            key={e.nome}
            title={`${e.ano} ${e.nome}`}
            style={{ flex: `${e.ano} 0 0`, background: e.cor }}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {estatisticas.map((e) => (
          <li key={e.nome} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 border border-black"
              style={{ background: e.cor }}
            />
            {e.ano} {e.nome}
          </li>
        ))}
      </ul>

    </div>
  );
}