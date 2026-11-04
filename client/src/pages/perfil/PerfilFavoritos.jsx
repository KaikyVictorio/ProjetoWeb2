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

  if (itens.length === MAX_FAVORITOS) {
    const [destaque, ...resto] = itens;

    return (
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2 row-span-2">
          <CapaItem item={destaque} className="h-full" onRemover={remover(destaque)} />
        </div>
        {resto.map((item) => (
          <CapaItem key={item.id} item={item} onRemover={remover(item)} />
        ))}
      </div>
    );
  }

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
  const [escolhendo, setEscolhendo] = useState(null);
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

  const remover = (obra) =>
    mudar(() => api.delete(`/me/favoritos/${obra.id}`));

  const categoriasComFavoritos = dados
    ? Object.keys(tituloFavoritos).filter(
        (tipo) => (dados[tipo] ?? []).length > 0
      )
    : [];

  const categoriasVazias = Object.keys(tituloFavoritos).filter(
    (tipo) => !categoriasComFavoritos.includes(tipo)
  );

  function botoesCriarCategoria() {
    return (
      <div className="flex flex-wrap justify-center gap-3 py-5">
        {categoriasVazias.map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setEscolhendo(tipo)}
            className="rounded-xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900 active:scale-[0.98]"
          >
            Criar categoria de {tipo === "serie" ? "séries" : tipo === "livro" ? "livros" : "jogos"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card titulo="">
      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {erroAcao && (
        <p role="alert" className="pb-3 text-left text-sm text-red-700">
          {erroAcao}
        </p>
      )}

      {dados && categoriasComFavoritos.length === 0 && ehMeu && (
        <div className="px-4 py-5">
          {botoesCriarCategoria()}
        </div>
      )}

      {dados && categoriasComFavoritos.length === 0 && !ehMeu && (
        <p className="py-8 text-center text-sm text-slate-500">
          Este usuário ainda não tem favoritos.
        </p>
      )}

      {dados && categoriasComFavoritos.length > 0 && (
        <div className="space-y-10 pl-10 pr-10">
          {categoriasComFavoritos.map((tipo) => (
            <section key={tipo}>
              <p className="pb-3 pt-3 text-left font-menu text-[30px] font-bold tracking-widest">
                {tituloFavoritos[tipo]}
              </p>

              <Mosaico
                itens={(dados[tipo] ?? []).slice(0, MAX_FAVORITOS)}
                editavel={ehMeu}
                onAdicionar={() => setEscolhendo(tipo)}
                onRemover={remover}
              />
            </section>
          ))}

          {ehMeu && categoriasVazias.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              {botoesCriarCategoria()}
            </div>
          )}
        </div>
      )}

      {escolhendo && (
        <ModalBuscaObra
          titulo={tituloFavoritos[escolhendo]}
          categoria={escolhendo}
          ocultarIds={(dados?.[escolhendo] ?? []).map((o) => o.id)}
          onEscolher={adicionar}
          onClose={() => setEscolhendo(null)}
        />
      )}
    </Card>
  );
}
