import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import FiltroBotao from "../../components/FiltroBotao";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { useLogs } from "../../context/LogsContext";
import { useApi } from "../../hooks/useApi";

const filtros = [
  { tipo: "livro", label: "livro", cor: "#a284da" },
  { tipo: "serie", label: "série", cor: "#f6d57b" },
  { tipo: "jogo", label: "jogo", cor: "#65dbeb" },
];

export default function PerfilAcervo() {
  const { usuarioId, usuario } = useOutletContext();
  const { versao } = useLogs();
  const [filtro, setFiltro] = useState(null);

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/acervo`),
    [usuarioId, versao]
  );

  const obras = dados ?? [];
  const visiveis = filtro ? obras.filter((o) => o.categoria === filtro) : obras;

  function alternar(tipo) {
    setFiltro((atual) => (atual === tipo ? null : tipo));
  }

  return (
    <Card titulo={`Biblioteca de ${usuario.nome}`}>
      <div className="mb-5 flex flex-wrap justify-end gap-3">
        {filtros.map((f) => (
          <FiltroBotao key={f.tipo} ativo={filtro === f.tipo} cor={f.cor} onClick={() => alternar(f.tipo)}>
            {f.label}
          </FiltroBotao>
        ))}
      </div>

      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {dados && visiveis.length === 0 && (
        <p className="text-slate-400">
          {filtro ? "Nenhuma obra nesta categoria." : "Nenhuma obra registrada ainda."}
        </p>
      )}

      {visiveis.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
          {visiveis.map((item) => (
            <CapaItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}
