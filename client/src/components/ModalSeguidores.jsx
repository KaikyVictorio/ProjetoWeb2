import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
// Copie estes três imports do topo do Perfil.jsx (ajuste os caminhos se forem diferentes):
import { api } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function ModalSeguidores({ usuarioId, tipo, onClose, onMudou }) {
  const { usuario: eu } = useAuth();
  const navigate = useNavigate();
  const [erroAcao, setErroAcao] = useState("");
  const [ocupado, setOcupado] = useState(null);

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/${tipo}`),
    [usuarioId, tipo]
  );

  const lista = dados ?? [];
  const titulo = tipo === "seguidores" ? "Seguidores" : "Seguindo";

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  async function alternar(u) {
    if (!eu) return navigate("/login");
    setErroAcao("");
    setOcupado(u.id);
    try {
      await (u.euSigo
        ? api.delete(`/usuarios/${u.id}/seguir`)
        : api.post(`/usuarios/${u.id}/seguir`));
      recarregar();
      onMudou?.(); // atualiza os números do perfil
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[70vh] w-full max-w-sm flex-col rounded-xl border-2 border-black bg-white text-left text-black shadow-[4px_4px_0_0_#000]"
      >
        <p className="border-b border-neutral-300 px-4 py-3 font-mono text-sm font-bold uppercase tracking-wide">
          {titulo}
        </p>

        {erroAcao && (
          <p role="alert" className="border-b border-neutral-200 px-4 py-2 text-xs text-red-700">
            {erroAcao}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {carregando && !dados ? (
            <p className="px-4 py-6 text-sm text-neutral-500">Carregando...</p>
          ) : erro && !dados ? (
            <p className="px-4 py-6 text-sm text-red-700">
              {String(erro?.message ?? erro)}
            </p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">Ninguém por aqui ainda.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {lista.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <Link
                    to={`/usuarios/${u.id}`}
                    onClick={onClose}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-400 bg-slate-700">
                      <Avatar src={u.foto} nome={u.nome} className="h-full w-full" />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <strong className="block truncate text-sm">{u.nome}</strong>
                      <span className="block truncate font-mono text-xs text-neutral-500">
                        @{u.usuario}
                      </span>
                    </span>
                  </Link>

                  {u.id !== eu?.id && (
                    <button
                      type="button"
                      disabled={ocupado === u.id}
                      onClick={() => alternar(u)}
                      className={`shrink-0 rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition disabled:opacity-50 ${
                        u.euSigo
                          ? "border-neutral-400 bg-white text-black hover:border-red-500 hover:text-red-600"
                          : "border-black bg-black text-white hover:bg-neutral-700"
                      }`}
                    >
                      {u.euSigo ? "parar de seguir" : "seguir"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}