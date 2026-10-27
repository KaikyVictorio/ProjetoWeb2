import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const campo =
  "w-full rounded-md border-2 border-black bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300";

const botao =
  "rounded-sm border px-3 py-2 font-mono text-sm font-bold uppercase transition hover:translate-x-[1px] hover:translate-y-[1px]";

export default function EditarPerfil() {
  const { usuario, atualizarUsuario, sair } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario.nome);
  const [bio, setBio] = useState(usuario.bio);
  const [foto, setFoto] = useState(usuario.foto);
  const [infos, setInfos] = useState(usuario.infos);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  function mudarInfo(indice, chave, valor) {
    setInfos((atuais) => atuais.map((info, i) => (i === indice ? { ...info, [chave]: valor } : info)));
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const { usuario: atualizado } = await api.put("/usuarios/me", { nome, bio, foto, infos });
      atualizarUsuario(atualizado);
      navigate("/perfil");
    } catch (e2) {
      setErro(e2.message);
      setSalvando(false);
    }
  }

  async function excluirConta() {
    setErro("");
    try {
      await api.delete("/usuarios/me");
      sair();
      navigate("/");
    } catch (e) {
      setErro(e.message);
      setConfirmando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <p className="mb-5! border-b border-black pb-2 text-left font-menu font-bold text-[26px] tracking-wide">
          Editar perfil
        </p>

        <form onSubmit={salvar} className="space-y-5 text-left">
          <p className="font-mono text-sm text-neutral-600">
            Usuário: <strong className="text-black">@{usuario.usuario}</strong> · E-mail: {usuario.email}
          </p>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} required className={campo} />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className={`${campo} resize-none`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Foto (URL da imagem)</span>
            <input
              type="url"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="https://..."
              className={campo}
            />
          </label>

          <div>
            <span className="mb-1 block font-mono text-sm">Informações do perfil</span>
            <ul className="space-y-2">
              {infos.map((info, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    value={info.rotulo}
                    onChange={(e) => mudarInfo(i, "rotulo", e.target.value)}
                    maxLength={30}
                    placeholder="ex.: idade"
                    aria-label="Rótulo"
                    className={`${campo} w-1/3`}
                  />
                  <input
                    value={info.valor}
                    onChange={(e) => mudarInfo(i, "valor", e.target.value)}
                    maxLength={60}
                    placeholder="ex.: 20"
                    aria-label="Valor"
                    className={campo}
                  />
                  <button
                    type="button"
                    onClick={() => setInfos((atuais) => atuais.filter((_, j) => j !== i))}
                    aria-label="Remover informação"
                    className="shrink-0 px-2 text-xl text-neutral-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {infos.length < 8 && (
              <button
                type="button"
                onClick={() => setInfos((atuais) => [...atuais, { rotulo: "", valor: "" }])}
                className={`${botao} mt-3 border-black bg-white text-black`}
              >
                [+] adicionar informação
              </button>
            )}
          </div>

          {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={salvando}
                className={`${botao} p-2! border-black bg-yellow-300 text-black shadow-[2px_2px_0_0_#666] disabled:opacity-60`}
              >
                {salvando ? "salvando..." : "salvar"}
              </button>
              <Link to="/perfil" className={`${botao} p-2! border-black bg-white text-black`}>
                cancelar
              </Link>
            </div>

            {confirmando ? (
              <span className="flex items-center gap-2 font-mono text-sm">
                Apagar a conta e tudo que ela tem?
                <button type="button" onClick={excluirConta} className={`${botao} border-black bg-red-500 text-white`}>
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
                excluir conta
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
