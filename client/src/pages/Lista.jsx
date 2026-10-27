import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import CapaItem from "../components/CapaItem";
import { Carregando, MensagemErro } from "../components/Estado";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

const botao =
  "rounded-sm border px-3 py-2 font-mono text-sm font-bold uppercase transition hover:translate-x-[1px] hover:translate-y-[1px]";

export default function Lista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [confirmando, setConfirmando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState("");

  const { dados: lista, carregando, erro, recarregar } = useApi(() => api.get(`/listas/${id}`), [id]);

  if (carregando && !lista) {
    return <div className="mx-auto w-full max-w-5xl px-4 py-10"><Carregando /></div>;
  }

  if (erro || !lista) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <Card>
          <MensagemErro erro={erro || "Lista não encontrada."} onTentarDeNovo={erro && !erro.includes("encontrada") ? recarregar : undefined} />
          <Link to="/listas" className="font-mono text-sm underline">voltar às listas</Link>
        </Card>
      </div>
    );
  }

  const obras = lista.obras;
  const ehMinha = usuario?.id === lista.autor.id;

  async function excluir() {
    setErroExcluir("");
    try {
      await api.delete(`/listas/${lista.id}`);
      navigate("/perfil/listas");
    } catch (e) {
      setErroExcluir(e.message);
      setConfirmando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h1 className="font-mono font-bold" style={{ fontSize: 32, lineHeight: 2, margin: 0 }}>
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
              Criado por{" "}
              <Link to={`/usuarios/${lista.autor.id}`} className="font-bold text-black hover:underline">
                @{lista.autor.usuario}
              </Link>
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
                  <button type="button" onClick={excluir} className={`${botao} border-black bg-red-500 text-white`}>
                    sim
                  </button>
                  <button type="button" onClick={() => setConfirmando(false)} className={`${botao} border-black bg-white text-black`}>
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

        {erroExcluir && <p role="alert" className="mt-3 text-left text-sm text-red-700">{erroExcluir}</p>}

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
              <CapaItem key={o.id} item={o} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
