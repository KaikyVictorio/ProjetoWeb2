import { Link, Navigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import Paginacao from "../../components/Paginacao";
import { Carregando, MensagemErro } from "../../components/Estado";
import { api } from "../../api";
import { categoriasWishlist } from "../../constants";
import { useApi } from "../../hooks/useApi";

const POR_PAGINA = 30;

export default function PerfilWishlistCategoria() {
  const { slug } = useParams();
  const { usuarioId, base, ehMeu } = useOutletContext();
  const [params, setParams] = useSearchParams();

  const cat = categoriasWishlist.find((c) => c.slug === slug);
  const { dados, carregando, erro, recarregar } = useApi(
    () => api.get(`/usuarios/${usuarioId}/wishlist`),
    [usuarioId]
  );

  if (!cat) return <Navigate to={`${base}/wishlist`} replace />;

  const obras = dados?.[cat.tipo] ?? [];
  const total = Math.max(1, Math.ceil(obras.length / POR_PAGINA));
  const pagina = Math.min(Math.max(Number(params.get("pagina")) || 1, 1), total);
  const visiveis = obras.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function mudarPagina(n) {
    setParams(n === 1 ? {} : { pagina: n });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remover(obra) {
    await api.delete(`/me/wishlist/${obra.id}`).catch(() => {});
    recarregar();
  }

  return (
    <Card>
      <Link to={`${base}/wishlist`} className="font-mono text-sm uppercase text-neutral-700 hover:text-black">
        voltar
      </Link>

      <p className="font-bold pb-3 pt-3 mb-10 font-menu text-[30px] text-left tracking-widest">{cat.titulo}</p>

      {erro && <MensagemErro erro={erro} onTentarDeNovo={recarregar} />}
      {carregando && !dados && <Carregando />}
      {dados && visiveis.length === 0 && <p className="text-slate-400">Nada por aqui ainda.</p>}

      {visiveis.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {visiveis.map((item) => (
            <CapaItem key={item.id} item={item} onRemover={ehMeu ? () => remover(item) : undefined} />
          ))}
        </div>
      )}

      <Paginacao pagina={pagina} total={total} onChange={mudarPagina} cor={cat.cor} />
    </Card>
  );
}
