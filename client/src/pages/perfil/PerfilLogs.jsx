import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import FiltroBotao from "../../components/FiltroBotao";
import Paginacao from "../../components/Paginacao";
import ItemFeed from "../../components/ItemFeed";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { useLogs } from "../../context/LogsContext";
import { useApi } from "../../hooks/useApi";

const POR_PAGINA = 10;

export default function PerfilLogs() {
  const { usuarioId, ehMeu } = useOutletContext();
  const { versao, editarLog, notificar } = useLogs();
  const [soReviews, setSoReviews] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [erroAcao, setErroAcao] = useState("");

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/logs`),
    [usuarioId, versao]
  );

  const feed = dados ?? [];
  const lista = soReviews ? feed.filter((i) => i.tipo === "review") : feed;
  const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const atual = Math.min(pagina, total);
  const visiveis = lista.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);

  function alternarFiltro() {
    setSoReviews((v) => !v);
    setPagina(1);
  }

  function mudarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(item) {
    setErroAcao("");
    try {
      await api.delete(`/logs/${item.id}`);
      notificar();
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  return (
    <Card titulo="Atividade">
      <div className="flex justify-end">
        <FiltroBotao ativo={soReviews} cor="#f1d37f" onClick={alternarFiltro}>
          reviews
        </FiltroBotao>
      </div>

      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {erroAcao && <p role="alert" className="py-2 text-left text-sm text-red-700">{erroAcao}</p>}
      {carregando && !dados && <Carregando />}

      {dados && visiveis.length === 0 && <p className="py-6 text-slate-400">Nenhuma atividade ainda.</p>}

      {visiveis.length > 0 && (
        <ul className="divide-y divide-dashed divide-neutral-400">
          {visiveis.map((item) => (
            <ItemFeed
              key={item.id}
              item={item}
              onEditar={ehMeu ? editarLog : undefined}
              onExcluir={ehMeu ? excluir : undefined}
            />
          ))}
        </ul>
      )}

      <Paginacao pagina={atual} total={total} onChange={mudarPagina} cor="#f1d37f" />
    </Card>
  );
}
