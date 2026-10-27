import { Link } from "react-router-dom";
import Card from "../components/Card";
import ListaCard from "../components/ListaCard";
import { listas } from "../data/listas";

export default function Listas() {
  const recentes = listas.slice(0, 12);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="flex justify-end">
          <Link
            to="/listas/nova"
            className="rounded-sm border border-slate-300 bg-gray-700 px-3 py-2 font-mono text-[16px] font-bold uppercase text-white shadow-[2px_1px_0_0_#554769] transition hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            [+] criar lista
          </Link>
        </div>

        <p className="mb-6 mt-4 pb-10 text-left font-menu font-bold text-[35px] tracking-wide">
          Listas mais recentes
        </p>

        {recentes.length === 0 ? (
          <p className="text-slate-400">Nenhuma lista criada ainda.</p>
        ) : (
          <div className="grid gap-x-15 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {recentes.map((l) => (
              <ListaCard key={l.id} lista={l} />
            ))}
          </div>
        )}
    </div>
  );
}