import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import ModalBuscaObra from "../../components/ModalBuscaObra";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { categoriasWishlist } from "../../constants";
import { useApi } from "../../hooks/useApi";

const botaoPequeno =
  "rounded-lg border border-black bg-white px-3 py-1 font-mono text-[15px] font-bold uppercase tracking-wide text-black transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]";

export default function PerfilWishlist() {
  const { usuarioId, base, ehMeu } = useOutletContext();
  const [escolhendo, setEscolhendo] = useState(null); // categoria aberta no seletor
  const [erroAcao, setErroAcao] = useState("");

  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/wishlist`),
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
    mudar(() => api.post("/me/wishlist", { obraId: obra.id }));
  };
  const remover = (obra) => mudar(() => api.delete(`/me/wishlist/${obra.id}`));

  return (
    <Card>
      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {erroAcao && <p role="alert" className="pb-3 text-left text-sm text-red-700">{erroAcao}</p>}

      {dados && (
        <div className="space-y-10">
          {categoriasWishlist.map((cat) => {
            const obras = dados[cat.tipo];

            return (
              <section key={cat.slug}>
                <div className="mb-10 flex items-center justify-between gap-3">
                  <p className="font-bold pb-3 pt-3 font-menu text-[30px] text-left tracking-widest">{cat.titulo}</p>
                  {ehMeu && (
                    <button type="button" onClick={() => setEscolhendo(cat)} className={botaoPequeno}>
                      [+] adicionar
                    </button>
                  )}
                </div>

                {obras.length === 0 ? (
                  <p className="text-left text-slate-400">Nada por aqui ainda.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                    {obras.slice(0, 5).map((item) => (
                      <CapaItem key={item.id} item={item} onRemover={ehMeu ? () => remover(item) : undefined} />
                    ))}
                  </div>
                )}

                {obras.length > 5 && (
                  <div className="mt-1 flex justify-end">
                    <Link to={`${base}/wishlist/${cat.slug}`} className={botaoPequeno}>
                      ver mais →
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {escolhendo && (
        <ModalBuscaObra
          titulo={escolhendo.titulo}
          categoria={escolhendo.tipo}
          ocultarIds={dados[escolhendo.tipo].map((o) => o.id)}
          onEscolher={adicionar}
          onClose={() => setEscolhendo(null)}
        />
      )}
    </Card>
  );
}
