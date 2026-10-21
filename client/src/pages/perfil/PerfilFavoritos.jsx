import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import AdicionarItem from "../../components/AdicionarItem";
import { favoritos, MAX_FAVORITOS } from "../../data/favoritos";

function Mosaico({ itens, onAdicionar }) {
  // 5 obras
  if (itens.length === MAX_FAVORITOS) {
    const [destaque, ...resto] = itens;

    return (
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 row-span-2">
          <CapaItem item={destaque} className="h-full" />
        </div>
        {resto.map((item) => (
          <CapaItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  // 0 a 4 obras
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
      {itens.map((item) => (
        <CapaItem key={item.id} item={item} />
      ))}
      <AdicionarItem onClick={onAdicionar} />
    </div>
  );
}

export default function PerfilFavoritos() {
  return (
    <Card titulo="★★★★★">
      <div className="space-y-10 pl-10 pr-10">
        {favoritos.map((cat) => (
          <section key={cat.tipo}>
            <p className="pb-3 pt-3 font-menu font-bold text-[27px] text-left tracking-widest">
              {cat.titulo}
            </p>
            <Mosaico
              itens={cat.itens.slice(0, MAX_FAVORITOS)}
              onAdicionar={() => console.log("adicionar favorito em", cat.tipo)}
            />
          </section>
        ))}
      </div>
    </Card>
  );
}