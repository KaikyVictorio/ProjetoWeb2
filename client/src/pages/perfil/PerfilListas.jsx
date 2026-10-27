import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import Paginacao from "../../components/Paginacao";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { useApi } from "../../hooks/useApi";

const POR_PAGINA = 7;
const SLOTS = 5;

function Previa({ obras }) {
  return (
    <div className="flex shrink-0 divide-x divide-neutral-500 border border-neutral-500">
      {Array.from({ length: SLOTS }, (_, i) => {
        const o = obras[i];
        return (
          <div key={i} className="h-[72px] w-12 overflow-hidden bg-neutral-200">
            {o?.imagem && <img src={o.imagem} alt="" className="h-full w-full object-cover" />}
          </div>
        );
      })}
    </div>
  );
}

export default function PerfilListas() {
  const { usuarioId, ehMeu } = useOutletContext();
  const [pagina, setPagina] = useState(1);

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/listas?usuario=${usuarioId}&limite=100`),
    [usuarioId]
  );

  const listas = dados ?? [];
  const total = Math.max(1, Math.ceil(listas.length / POR_PAGINA));
  const atual = Math.min(pagina, total);
  const visiveis = listas.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);

  function mudarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Card>
      <div className="mb-2 mt-4 flex items-end justify-between gap-3 border-b border-black pb-2">
        <p className="text-left font-menu font-bold text-[28px] tracking-widest">
          {ehMeu ? "Suas listas" : "Listas"}
        </p>
        {ehMeu && (
          <Link
            to="/listas/nova"
            className="rounded-sm border border-slate-300 bg-gray-700 px-3 py-2 font-mono text-sm font-bold uppercase text-white shadow-[2px_1px_0_0_#554769]"
          >
            [+] criar lista
          </Link>
        )}
      </div>

      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {dados && visiveis.length === 0 && (
        <p className="py-6 text-left text-sm text-slate-500">
          {ehMeu ? "Você ainda não criou nenhuma lista." : "Nenhuma lista criada ainda."}
        </p>
      )}

      {visiveis.length > 0 && (
        <ul className="divide-y divide-neutral-300">
          {visiveis.map((l) => (
            <li key={l.id} className="flex items-start gap-4 py-4">
              <Link to={`/listas/${l.id}`}>
                <Previa obras={l.obras} />
              </Link>

              <div className="min-w-0 flex-1 text-left">
                <Link to={`/listas/${l.id}`} className="font-mono text-md font-bold hover:underline">
                  {l.titulo}
                </Link>

                <p className="mt-1 flex items-center gap-2 font-mono text-xs text-neutral-600">
                  {l.total} {l.total === 1 ? "item" : "itens"}
                  {ehMeu && (
                    <Link
                      to={`/listas/${l.id}/editar`}
                      aria-label={`Editar ${l.titulo}`}
                      className="text-neutral-500 transition hover:text-black"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </Link>
                  )}
                </p>

                {l.descricao && (
                  <p className="mt-2 line-clamp-2 text-sm leading-snug text-neutral-800">{l.descricao}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Paginacao pagina={atual} total={total} onChange={mudarPagina} />
    </Card>
  );
}
