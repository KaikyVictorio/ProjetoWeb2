import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import AdicionarItem from "../../components/AdicionarItem";
import ModalBuscaObra from "../../components/ModalBuscaObra";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { MAX_FAVORITOS, tituloFavoritos } from "../../constants";
import { useApi } from "../../hooks/useApi";

function Mosaico({ itens, editavel, onAdicionar, onRemover }) {
  const remover = (item) => (editavel ? () => onRemover(item) : undefined);

  // 5 obras
  if (itens.length === MAX_FAVORITOS) {
    const [destaque, ...resto] = itens;

    return (
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 row-span-2">
          <CapaItem item={destaque} className="h-full" onRemover={remover(destaque)} />
        </div>
        {resto.map((item) => (
          <CapaItem key={item.id} item={item} onRemover={remover(item)} />
        ))}
      </div>
    );
  }

  // 0 a 4 obras
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
      {itens.map((item) => (
        <CapaItem key={item.id} item={item} onRemover={remover(item)} />
      ))}
      {editavel && <AdicionarItem onClick={onAdicionar} />}
    </div>
  );
}

export default function PerfilFavoritos() {
  const { usuarioId, ehMeu } = useOutletContext();
  const [escolhendo, setEscolhendo] = useState(null); // categoria aberta no seletor
  const [erroAcao, setErroAcao] = useState("");

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/favoritos`),
    [usuarioId]
  );

  async function mudar(operacao) {
    setErroAcao("");
    try {
      await operacao();
      recarregar();
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  const adicionar = (obra) => {
    setEscolhendo(null);
    mudar(() => api.post("/me/favoritos", { obraId: obra.id }));
  };
  const remover = (obra) => mudar(() => api.delete(`/me/favoritos/${obra.id}`));

  return (
    <Card titulo="★★★★★">
      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {erroAcao && <p role="alert" className="pb-3 text-left text-sm text-red-700">{erroAcao}</p>}

      {dados && (
        <div className="space-y-10 pl-10 pr-10">
          {Object.keys(tituloFavoritos).map((tipo) => (
            <section key={tipo}>
              <p className="pb-3 pt-3 font-menu font-bold text-[27px] text-left tracking-widest">
                {tituloFavoritos[tipo]}
              </p>
              <Mosaico
                itens={dados[tipo].slice(0, MAX_FAVORITOS)}
                editavel={ehMeu}
                onAdicionar={() => setEscolhendo(tipo)}
                onRemover={remover}
              />
            </section>
          ))}
        </div>
      )}

      {escolhendo && (
        <ModalBuscaObra
          titulo={tituloFavoritos[escolhendo]}
          categoria={escolhendo}
          ocultarIds={dados[escolhendo].map((o) => o.id)}
          onEscolher={adicionar}
          onClose={() => setEscolhendo(null)}
        />
      )}
    </Card>
  );
}
