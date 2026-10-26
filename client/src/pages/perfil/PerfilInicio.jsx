import Card from "../../components/Card";
import RotacaoAtual from "../../components/RotacaoAtual";
import Estatisticas from "../../components/Estatisticas";
import AtividadeRecente from "../../components/AtividadeRecente";

export default function PerfilInicio() {
  return (
    <>
      <Card titulo="Rotação atual" className="">
        <RotacaoAtual />
      </Card>

      <div className="grid items-start gap-5 md:grid-cols-[2fr_1fr]">
        <Card titulo="Atividade recente">
            <AtividadeRecente />
        </Card>

        <Card titulo="Estatísticas">
          <Estatisticas />
        </Card>
      </div>
    </>
  );
}