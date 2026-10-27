import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TagTipo from "./TagTipo";
import { useBuscaObras } from "../hooks/useBuscaObras";

// Janela para escolher uma obra do catálogo (rotação, favoritos, wishlist...).
//   categoria: limita a busca a um tipo ("livro" | "serie" | "jogo")
//   ocultarIds: obras que já estão na coleção e não devem aparecer
export default function ModalBuscaObra({ titulo, categoria, ocultarIds = [], onEscolher, onClose }) {
  const [busca, setBusca] = useState("");
  const { resultados, buscando, erro } = useBuscaObras(busca, { categoria, limite: 12 });

  useEffect(() => {
    const fechar = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onClose]);

  const visiveis = resultados.filter((o) => !ocultarIds.includes(o.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border-2 border-black bg-white text-left text-black shadow-[6px_6px_0_0_#000]"
      >
        <header className="flex shrink-0 items-center justify-between border-b-2 border-neutral-300 bg-[radial-gradient(ellipse_at_center,#f0f0f0_35%,#fff_100%)] px-5 py-3">
          <h2 className="m-0! font-mono text-lg! font-bold">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-2xl leading-none">
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <input
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo título..."
            className="w-full rounded-md border-2 border-black bg-white p-2 outline-none focus:ring-2 focus:ring-yellow-300"
          />

          {erro && <p className="mt-3 text-sm text-red-700">{erro}</p>}
          {!erro && !buscando && visiveis.length === 0 && (
            <p className="mt-3 text-sm text-neutral-500">Nada encontrado.</p>
          )}

          <ul className="mt-3 divide-y divide-neutral-300">
            {visiveis.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => onEscolher(o)}
                  className="flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-neutral-100"
                >
                  <span className="h-12 w-8 shrink-0 overflow-hidden border border-neutral-600 bg-neutral-300">
                    {o.imagem && <img src={o.imagem} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1 font-menu">
                    <strong>{o.titulo}</strong> <span className="text-neutral-600">{o.ano}</span>
                  </span>
                  <TagTipo tipo={o.categoria} />
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
      </div>
    </div>
  );
}
