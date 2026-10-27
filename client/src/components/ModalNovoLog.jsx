import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBuscaObras } from "../hooks/useBuscaObras";
import Avaliacao from "./Avaliacao";

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

const botao =
  "rounded-lg border-2 border-black px-3 py-1 font-mono text-sm font-bold uppercase tracking-wide text-black transition hover:translate-x-[1px] hover:translate-y-[1px]";

// Modal de novo log. Também serve para editar:
//   obraInicial: abre já na etapa de escrever (ex.: botão "Logar" da página da obra)
//   logInicial:  edita um log existente (a obra não pode ser trocada)
//   onSalvar:    async; se lançar erro, a mensagem aparece no modal
export default function ModalNovoLog({ onClose, onSalvar, obraInicial = null, logInicial = null }) {
  const [obra, setObra] = useState(logInicial?.obra ?? obraInicial);
  const [busca, setBusca] = useState("");
  const [jaFeito, setJaFeito] = useState(logInicial?.jaFeito ?? false);
  const [texto, setTexto] = useState(logInicial?.texto ?? "");
  const [spoiler, setSpoiler] = useState(logInicial?.spoiler ?? false);
  const [nota, setNota] = useState(logInicial?.nota ?? 0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const editando = Boolean(logInicial);
  const { resultados, buscando, erro: erroBusca } = useBuscaObras(busca, { limite: 8 });

  useEffect(() => {
    const fechar = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onClose]);

  async function salvar() {
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ obra, jaFeito, texto: texto.trim(), spoiler, nota });
      onClose();
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  const v = obra ? verbos[obra.categoria] : null;
  const podeVoltar = obra && !editando && !obraInicial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(900px, 100%)" }}
        className="flex max-h-[85vh] flex-col overflow-hidden rounded-xl border-2 border-black bg-white text-left text-black shadow-[6px_6px_0_0_#000]"
      >
        <header className="flex shrink-0 items-center justify-between border-b-2 border-neutral-300 bg-[radial-gradient(ellipse_at_center,#f0f0f0_35%,#fff_100%)] px-5 py-3">
          <div className="flex items-center gap-3">
            {podeVoltar && (
              <button type="button" onClick={() => setObra(null)} className={`${botao} bg-white py-0.5 text-xs`}>
                ← voltar
              </button>
            )}
            <h2 className="m-0! font-mono text-lg! font-bold">
              {obra ? v.titulo : "Adicionar aos seus logs..."}
              {editando && <span className="ml-2 text-sm font-normal text-neutral-500">(editando)</span>}
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

              {erroBusca && <p className="mt-4 text-sm text-red-700">{erroBusca}</p>}
              {!erroBusca && !buscando && resultados.length === 0 && (
                <p className="mt-4 text-sm text-neutral-500">Nada encontrado.</p>
              )}

              <ul className="mt-3 divide-y divide-neutral-400">
                {resultados.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setObra(c)}
                      className="flex w-full items-center justify-between gap-4 px-1 py-3 text-left font-menu hover:bg-neutral-100"
                    >
                      <span>
                        <strong>{c.titulo}</strong> <span className="text-neutral-600">{c.ano}</span>
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

              <p className="mt-4 text-xs text-neutral-600">
                Não achou?{" "}
                <Link to="/obras/nova" onClick={onClose} className="underline">
                  cadastre a obra
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-row gap-0 p-6">
              <div className="shrink-0" style={{ width: 220, minWidth: 220, maxWidth: 240 }}>
                <div
                  className="relative shrink-0 overflow-hidden border-2 border-neutral-800 bg-neutral-300 shadow-[4px_4px_0_0_#000]"
                  style={{ width: 170, height: 250, minWidth: 170, minHeight: 250 }}
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
                  {obra.titulo} <span className="text-lg font-normal text-neutral-500">{obra.ano}</span>
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
                    maxLength={5000}
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
          <footer className="flex shrink-0 items-center justify-end gap-4 bg-neutral-300 px-5 py-3">
            {erro && (
              <p role="alert" className="mr-auto text-sm text-red-700">
                {erro}
              </p>
            )}
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className={`${botao} bg-white shadow-[3px_3px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] disabled:opacity-60`}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
