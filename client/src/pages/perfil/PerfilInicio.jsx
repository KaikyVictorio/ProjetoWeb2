import { useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import RotacaoAtual from "../../components/RotacaoAtual";
import Estatisticas from "../../components/Estatisticas";
import AtividadeRecente from "../../components/AtividadeRecente";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { useLogs } from "../../context/LogsContext";
import { useApi } from "../../hooks/useApi";

export default function PerfilInicio() {
  const { usuarioId, base, ehMeu } = useOutletContext();
  const { versao } = useLogs();
  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/resumo`),
    [usuarioId, versao]
  );

  if (erro) return <Card><MensagemErro erro={erro} onTentarDeNovo={recarregar} /></Card>;
  if (!dados) return carregando ? <Card><Carregando /></Card> : null;

  return (
    <>
      <Card titulo="Rotação atual">
        <RotacaoAtual
          rotacao={dados.rotacao}
          fila={dados.fila}
          base={base}
          editavel={ehMeu}
          onMudou={recarregar}
        />
      </Card>

      <div className="grid items-start gap-5 md:grid-cols-[2fr_1fr]">
        <Card titulo="Atividade recente">
          <AtividadeRecente itens={dados.atividade} />
        </Card>

        <Card titulo="Estatísticas">
          <Estatisticas estatisticas={dados.estatisticas} />
        </Card>
      </div>
    </>
  );
}
