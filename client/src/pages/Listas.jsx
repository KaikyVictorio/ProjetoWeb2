import { Link } from "react-router-dom";
import ListaCard from "../components/ListaCard";
import { Carregando, MensagemErro } from "../components/Estado";
import { api } from "../api";
import { useApi } from "../hooks/useApi";

export default function Listas() {
  const { dados, carregando, erro, recarregar } = useApi(() => api.get("/listas?limite=12"), []);
  const recentes = dados ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="mb-0 mt-10! pb-10 text-left font-menu font-bold text-[50px] tracking-wide">
        Listas da comunidade
      </p>

      <h2 className="mb-10! font-bold! text-left font-menu tracking-wide text-[25px]!">Mais recentes:</h2>

      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {dados && recentes.length === 0 && (
        <p className="text-slate-400">Nenhuma lista criada ainda.</p>
      )}

      <div className="grid gap-x-15 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
        {/* widget "comece a sua lista" */}
        <Link
          to="/listas/nova"
          className="flex min-h-[300px] flex-col items-center justify-center gap-3.5 rounded-[18px] border-1 border border-[#e1e2e6] bg-[#fffff] p-6 text-center text-neutral-900 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFC800]/25"
        >
          <span className="grid h-13 w-13 place-items-center rounded-full border-[1.5px] border-neutral-900 bg-[#FFC800] shadow-[3px_3px_0_#111]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="font-menu text-xl font-extrabold tracking-tight">Comece a sua lista</span>
        </Link>

        {recentes.map((l) => (
          <ListaCard key={l.id} lista={l} />
        ))}
      </div>
    </div>
  );
}