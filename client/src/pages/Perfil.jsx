import { useState } from "react";
import { Link, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import MenuBotoes from "../components/MenuBotoes";
import { Carregando, MensagemErro } from "../components/Estado";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLogs } from "../context/LogsContext";
import { useApi } from "../hooks/useApi";

const fundo = "url('https://i.pinimg.com/736x/79/1e/78/791e78da281e281ddbb3a27929943f0b.jpg')";

// Layout do perfil. Serve para o meu perfil (/perfil) e para o de outras pessoas (/usuarios/:id).
// As páginas internas recebem { usuarioId, base, ehMeu, usuario } por useOutletContext().
function PerfilLayout({ usuarioId, base, ehMeu }) {
  const { usuario: eu } = useAuth();
  const { abrirModal } = useLogs();
  const navigate = useNavigate();
  const [erroSeguir, setErroSeguir] = useState("");

  const { dados: usuario, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}`),
    [usuarioId, eu?.id]
  );

  if (carregando && !usuario) {
    return <div className="mx-auto max-w-5xl px-4 py-10"><Carregando /></div>;
  }
  if (erro || !usuario) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <MensagemErro erro={erro || "Usuário não encontrado."} onTentarDeNovo={recarregar} />
          <Link to="/" className="font-mono text-sm underline">voltar ao início</Link>
        </Card>
      </div>
    );
  }

  async function alternarSeguir() {
    if (!eu) return navigate("/login");
    setErroSeguir("");
    try {
      await (usuario.euSigo ? api.delete(`/usuarios/${usuario.id}/seguir`) : api.post(`/usuarios/${usuario.id}/seguir`));
      recarregar();
    } catch (e) {
      setErroSeguir(e.message);
    }
  }

  return (
    <div className="bg-cover bg-center bg-fixed bg-repeat bg-size-[170px]" style={{ backgroundImage: fundo }}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-13 md:flex-row md:items-start">
        <aside className="w-full md:sticky md:top-4 md:w-65 md:shrink-0 space-y-6">
          <Card className="rounded-xl outline outline-1 outline-offset-1 outline-slate-700 shadow-[5px_2px_0_0_#424242]">
            <div className="mx-auto h-50 w-50 overflow-hidden rounded-full border border-slate-600 outline outline-1 outline-offset-4 outline-slate-200 bg-slate-700">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={`Foto de ${usuario.nome}`}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-6xl font-bold text-slate-300">
                  {usuario.nome[0]}
                </div>
              )}
            </div>

            <h1 className="mb-0! mt-2! text-[27px]! font-bold font-menu! leading-[1]!">{usuario.nome}</h1>
            <h3 className="mb-3 font-menu! text-[17px] text-neutral-700">@{usuario.usuario}</h3>
            {usuario.bio && <p className="rounded-md text-left text-sm text-black">{usuario.bio}</p>}

            <div className="mt-4 flex gap-4 text-[17px]">
              <div className="mx-auto flex items-center justify-center gap-4 border-t border-b border-slate-300 py-4 my-0 max-w-max">
                <span><strong className="text-[20px]">{usuario.seguidores}</strong> seguidores</span>
                <span><strong className="text-[20px]">{usuario.seguindo}</strong> seguindo</span>
              </div>
            </div>

            {usuario.infos.length > 0 && (
              <dl className="mt-1 font-mono text-sm">
                {usuario.infos.map((info) => (
                  <div
                    key={info.rotulo}
                    className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-500 py-3"
                  >
                    <dt className="font-bold">{info.rotulo}</dt>
                    <dd className="text-right">{info.valor}</dd>
                  </div>
                ))}
              </dl>
            )}

            {ehMeu ? (
              <Link
                to="/perfil/editar"
                className="mt-4 inline-block rounded-lg bg-gray-800 px-13 py-2 font-semibold hover:bg-gray-700 tracking-wide text-white text-sm"
              >
                Editar perfil
              </Link>
            ) : (
              <button
                type="button"
                onClick={alternarSeguir}
                className={`mt-4 rounded-lg px-13 py-2 text-sm font-semibold tracking-wide ${
                  usuario.euSigo ? "border border-black bg-white text-black hover:bg-neutral-100" : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {usuario.euSigo ? "Seguindo" : "Seguir"}
              </button>
            )}
            {erroSeguir && <p role="alert" className="mt-2 text-sm text-red-700">{erroSeguir}</p>}
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <MenuBotoes base={base} onNovoLog={ehMeu ? () => abrirModal() : undefined} />
          <Outlet context={{ usuarioId: usuario.id, usuario, base, ehMeu }} />
        </div>
      </div>
    </div>
  );
}

export function PerfilMeu() {
  const { usuario } = useAuth();
  return <PerfilLayout key={usuario.id} usuarioId={usuario.id} base="/perfil" ehMeu />;
}

export function PerfilPublico() {
  const { id } = useParams();
  const { usuario } = useAuth();
  // O próprio perfil sempre abre na versão editável
  if (usuario && String(usuario.id) === id) return <Navigate to="/perfil" replace />;
  return <PerfilLayout key={id} usuarioId={id} base={`/usuarios/${id}`} ehMeu={false} />;
}
