import { useEffect, useState } from "react";
import { catalogo } from "../data/catalogo";

const verbos = {
  livro: { titulo: "Eu li...", antes: "Já li isso antes" },
  serie: { titulo: "Eu assisti...", antes: "Já assisti isso antes" },
  jogo: { titulo: "Eu joguei...", antes: "Já joguei isso antes" },
};

const coresCategoria = {
  livro: { rotulo: "livro", cor: "#7A81E1" },
  serie: { rotulo: "série", cor: "#b8941f" },
  jogo: { rotulo: "jogo", cor: "#2aa7b8" },
};

function Avaliacao({ valor, onChange }) {
  const tamanho = 35;

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="relative block text-neutral-300"
          style={{ fontSize: tamanho, lineHeight: 1, width: tamanho, height: tamanho }}
        >
          ★
          <span
            className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-orange-500"
            style={{ width: valor >= n ? "100%" : valor === n - 0.5 ? "50%" : "0%" }}
          >
            ★
          </span>
          <button
            type="button"
            aria-label={`${n - 0.5} estrelas`}
            onClick={() => onChange(valor === n - 0.5 ? 0 : n - 0.5)}
            className="absolute inset-y-0 left-0 w-1/2"
          />
          <button
            type="button"
            aria-label={`${n} estrelas`}
            onClick={() => onChange(valor === n ? 0 : n)}
            className="absolute inset-y-0 right-0 w-1/2"
          />
        </span>
      ))}
    </div>
  );
}

const botao =
  "rounded-lg border-2 border-black px-3 py-1 font-mono text-sm font-bold uppercase tracking-wide text-black transition hover:translate-x-[1px] hover:translate-y-[1px]";

export default function ModalNovoLog({ onClose, onSalvar }) {
  const [obra, setObra] = useState(null);
  const [busca, setBusca] = useState("");
  const [jaFeito, setJaFeito] = useState(false);
  const [texto, setTexto] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    const fechar = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onClose]);

  const termo = busca.trim().toLowerCase();
  const resultados = termo
    ? catalogo.filter((c) => c.titulo.toLowerCase().includes(termo)).slice(0, 6)
    : [];

  function salvar() {
    onSalvar({ obra, jaFeito, texto: texto.trim(), spoiler, nota });
    onClose();
  }

  const v = obra ? verbos[obra.categoria] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(900px, 100%)" }}
        className="flex max-h-[85vh] flex-col overflow-hidden rounded-xl border-2 border-black bg-white text-left text-black shadow-[6px_6px_0_0_#000]"
        >
        <header className="flex shrink-0 items-center justify-between border-b-2 border-neutral-400 bg-neutral-100 px-5 py-3">
          <div className="flex items-center gap-3">
            {obra && (
              <button
                type="button"
                onClick={() => setObra(null)}
                className={`${botao} bg-white py-0.5 text-xs`}
              >
                ← voltar
              </button>
            )}
            <h2 className="font-mono text-lg font-bold">
              {obra ? v.titulo : "Adicionar aos seus logs..."}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-2xl leading-none">
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!obra ? (
            <div className="p-6">
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar livro, série ou jogo..."
                className="w-full rounded-md border-2 border-black bg-white p-2 outline-none focus:ring-2 focus:ring-yellow-300"
              />

              {termo && resultados.length === 0 && (
                <p className="mt-4 text-sm text-neutral-500">Nada encontrado.</p>
              )}

              <ul className="mt-3 divide-y divide divide-neutral-400">
                {resultados.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setObra(c)}
                      className="flex w-full items-center justify-between gap-4 px-1 py-3 text-left font-menu hover:bg-neutral-100"
                    >
                      <span>
                        <strong>{c.titulo}</strong>{" "}
                        <span className="text-neutral-600">{c.ano}</span>
                      </span>
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ color: coresCategoria[c.categoria].cor }}
                      >
                        {coresCategoria[c.categoria].rotulo}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-row gap-0 p-6">
                <div className="shrink-0" style={{ width: 220, minWidth: 220, maxWidth: 240 }}>
                    <div
                        className="relative shrink-0 overflow-hidden border-2 border-neutral-800 bg-neutral-300 shadow-[4px_4px_0_0_#000]"
                        style={{width: 170, height: 250, minWidth: 170, minHeight: 250 }}
                        >
                        <span className="absolute inset-0 grid place-items-center font-mono text-xs uppercase text-neutral-500">
                            sem capa
                        </span>

                        {obra.imagem && (
                            <img
                            src={obra.imagem}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                        )}
                        </div>

                <div className="mt-4">
                  <p className="mb-1 flex items-baseline gap-3 font-mono text-md">
                    Nota
                    <span className="text-sm text-neutral-500">{nota} de 5</span>
                  </p>
                  <Avaliacao valor={nota} onChange={setNota} />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <p className="font-mono text-2xl font-bold">
                  {obra.titulo}{" "}
                  <span className="text-lg font-normal text-neutral-500">{obra.ano}</span>
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jaFeito}
                      onChange={(e) => setJaFeito(e.target.checked)}
                      className="h-4 w-4 accent-black"
                    />
                    {v.antes}
                  </label>
                </div>

                <div className="overflow-hidden rounded-md border-1 border-black">
                  <textarea
                    rows={9}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escreva uma review (opcional)..."
                    className="block w-full resize-none p-3 text-sm outline-none"
                  />
                  <label className="flex cursor-pointer items-center gap-2 bg-neutral-100 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={spoiler}
                      onChange={(e) => setSpoiler(e.target.checked)}
                      className="h-4 w-4 accent-black"
                    />
                    Contém spoilers
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {obra && (
          <footer className="flex shrink-0 justify-end bg-neutral-700 px-5 py-3">
            <button
              type="button"
              onClick={salvar}
              className={`${botao} shadow-[3px_3px_0_0_#000] hover:shadow-[2px_2px_0_0_#000]`}
            >
              Salvar
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}