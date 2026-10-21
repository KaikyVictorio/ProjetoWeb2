import { Link } from "react-router-dom";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import { categorias, wishlist } from "../../data/wishlist";

export default function PerfilWishlist() {
  return (
    <Card>
      <div className="space-y-10">
        {categorias.map((cat) => {
          const obras = wishlist.filter((w) => w.tipo === cat.tipo);

          return (
            <section key={cat.slug}>
              <p className="font-bold pb-3 pt-3 mb-10 font-menu font text-[30px] text-left tracking-widest">
                {cat.titulo}
              </p>

              {obras.length === 0 ? (
                <p className="text-slate-400">Nada por aqui ainda.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {obras.slice(0, 5).map((item) => (
                    <CapaItem key={item.id} item={item} />
                  ))}
                </div>
              )}

              {obras.length > 5 && (
                <div className="mt-1 flex justify-end">
                  <Link
                    to={`/perfil/wishlist/${cat.slug}`}
                    className="rounded-lg border border-black bg-white px-3 py-1 font-mono text-[15px] font-bold uppercase tracking-wide text-black transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]"
                  >
                    ver mais →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </Card>
  );
}