import { Link } from "react-router-dom";
import Card from "../components/Card";
import ItemFeed from "../components/ItemFeed";
import { Carregando, MensagemErro } from "../components/Estado";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLogs } from "../context/LogsContext";
import { useApi } from "../hooks/useApi";

const botao =
  "rounded-sm border border-slate-300 bg-gray-700 px-3 py-2 font-mono text-[16px] font-bold uppercase text-white shadow-[2px_1px_0_0_#554769] transition hover:translate-x-[1px] hover:translate-y-[1px]";

export default function Home() {
  const { usuario } = useAuth();
  const { abrirModal, versao } = useLogs();
  const { dados, carregando, erro, recarregar } = useApi(() => api.get("/logs/feed?limite=20"), [versao]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8 text-left">
        <h1 className="m-0! font-menu text-[40px]! font-bold! leading-tight! tracking-normal!">
          {usuario ? `Olá, ${usuario.nome.split(" ")[0]}!` : "Livros, séries e jogos num só lugar."}
        </h1>
        <p className="mt-2 text-neutral-700">
          {usuario
            ? "Veja o que a comunidade andou registrando."
            : "Registre o que você leu, assistiu e jogou, escreva reviews e monte listas."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {usuario ? (
            <button type="button" onClick={() => abrirModal()} className={botao}>
              [+] novo log
            </button>
          ) : (
            <>
              <Link to="/cadastro" className={botao}>criar conta</Link>
              <Link to="/login" className={`${botao} bg-white text-black shadow-[2px_1px_0_0_#999]`}>entrar</Link>
            </>
          )}
        </div>
      </div>

      <Card titulo="Atividade da comunidade">
        {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
        {carregando && !dados && <Carregando />}
        {dados && dados.length === 0 && <p className="py-6 text-left text-slate-400">Nada registrado ainda. Seja a primeira pessoa!</p>}
        {dados && dados.length > 0 && (
          <ul className="divide-y divide-dashed divide-neutral-400">
            {dados.map((item) => (
              <ItemFeed key={item.id} item={item} mostrarUsuario />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
