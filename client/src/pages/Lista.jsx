import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import CapaItem from "../components/CapaItem";
import { catalogo } from "../data/catalogo";
import { listas } from "../data/listas";
import { usuario } from "../data/usuario";

const botao =
  "rounded-sm border px-3 py-2 font-mono text-sm font-bold uppercase transition hover:translate-x-[1px] hover:translate-y-[1px]";

export default function Lista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);

  const lista = listas.find((l) => String(l.id) === id);

  if (!lista) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <Card>
          <p className="font-mono">Lista não encontrada.</p>
          <Link to="/listas" className="font-mono text-sm underline">
            voltar às listas
          </Link>
        </Card>
      </div>
    );
  }

  const obras = lista.obraIds
    .map((oid) => catalogo.find((o) => o.id === oid))
    .filter(Boolean);

  const ehMinha = lista.autor.usuario === usuario.usuario;

  function excluir() {
    // com backend: DELETE /api/listas/:id
    console.log("excluir lista", lista.id);
    navigate("/perfil/listas");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h1
              className="font-mono font-bold"
              style={{ fontSize: 32, lineHeight: 2, margin: 0 }}
            >
              {lista.titulo}
            </h1>

            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-neutral-600">
              <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-500 bg-slate-700 text-xs text-slate-200">
                {lista.autor.foto ? (
                  <img src={lista.autor.foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  lista.autor.usuario[0].toUpperCase()
                )}
              </span>
              Criado por <strong className="text-black">@{lista.autor.usuario}</strong>
              <span>· {obras.length} {obras.length === 1 ? "item" : "itens"}</span>
            </p>
          </div>

          {ehMinha && (
            <div className="flex items-center gap-3">
              <Link
                to={`/listas/${lista.id}/editar`}
                className={`${botao} border-slate-300 bg-gray-700 text-white shadow-[2px_1px_0_0_#554769]`}
              >
                editar
              </Link>

              {confirmando ? (
                <span className="flex items-center gap-2 font-mono text-sm">
                  Excluir mesmo?
                  <button
                    type="button"
                    onClick={excluir}
                    className={`${botao} border-black bg-red-500 text-white`}
                  >
                    sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(false)}
                    className={`${botao} border-black bg-white text-black`}
                  >
                    não
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  className={`${botao} border-black bg-white text-red-600 hover:bg-red-50`}
                >
                  excluir
                </button>
              )}
            </div>
          )}
        </div>

        {lista.descricao && (
          <p className="mt-5 whitespace-pre-line text-left text-base leading-relaxed text-neutral-800">
            {lista.descricao}
          </p>
        )}

        {obras.length === 0 ? (
          <p className="mt-8 text-left text-sm text-slate-400">Esta lista ainda não tem obras.</p>
        ) : (
          <div className="mt-8 pl-7 pr-7 grid grid-cols-3 gap-3 md:grid-cols-5">
            {obras.map((o) => (
              <Link key={o.id} to={`/obras/${o.id}`}>
                <CapaItem item={o} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}