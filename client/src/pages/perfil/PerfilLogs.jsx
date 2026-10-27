import { useState } from "react";
import Card from "../../components/Card";
import FiltroBotao from "../../components/FiltroBotao";
import Paginacao from "../../components/Paginacao";
import ItemFeed from "../../components/ItemFeed";
import { feed } from "../../data/feed";

const POR_PAGINA = 10;

export default function PerfilLogs() {
  const [soReviews, setSoReviews] = useState(false);
  const [pagina, setPagina] = useState(1);

  const lista = soReviews ? feed.filter((i) => i.tipo === "review") : feed;
  const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const atual = Math.min(pagina, total);
  const visiveis = lista.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);

  function alternarFiltro() {
    setSoReviews((v) => !v);
    setPagina(1);
  }

  function mudarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Card titulo="Atividade">
      <div className=" flex justify-end">
        <FiltroBotao ativo={soReviews} cor="#f1d37f" onClick={alternarFiltro}>
          reviews
        </FiltroBotao>
      </div>

      {visiveis.length === 0 ? (
        <p className="py-6 text-slate-400">Nenhuma atividade ainda.</p>
      ) : (
        <ul className="divide-y divide-dashed divide-neutral-400">
          {visiveis.map((item) => (
            <ItemFeed key={item.id} item={item} />
          ))}
        </ul>
      )}

      <Paginacao pagina={atual} total={total} onChange={mudarPagina} cor="#f1d37f" />
    </Card>
  );
}