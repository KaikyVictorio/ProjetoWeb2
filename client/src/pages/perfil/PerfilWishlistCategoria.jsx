import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import Paginacao from "../../components/Paginacao";
import { categorias, wishlist } from "../../data/wishlist";

const POR_PAGINA = 30;

export default function PerfilWishlistCategoria() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();

  const cat = categorias.find((c) => c.slug === slug);
  if (!cat) return <Navigate to="/perfil/wishlist" replace />;

  const obras = wishlist.filter((w) => w.tipo === cat.tipo);
  const total = Math.max(1, Math.ceil(obras.length / POR_PAGINA));
  const pagina = Math.min(Math.max(Number(params.get("pagina")) || 1, 1), total);
  const visiveis = obras.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function mudarPagina(n) {
    setParams(n === 1 ? {} : { pagina: n });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Card>
      <Link
        to="/perfil/wishlist"
        className="font-mono text-sm uppercase text-neutral-700 hover:text-black"
      >
        voltar
      </Link>

      <p className="font-bold pb-3 pt-3 mb-10 font-menu font text-[30px] text-left tracking-widest">
        {cat.titulo}
        </p>

      {visiveis.length === 0 ? (
        <p className="text-slate-400">Nada por aqui ainda.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {visiveis.map((item) => (
            <CapaItem key={item.id} item={item} />
          ))}
        </div>
      )}

      <Paginacao pagina={pagina} total={total} onChange={mudarPagina} cor={cat.cor} />
    </Card>
  );
}