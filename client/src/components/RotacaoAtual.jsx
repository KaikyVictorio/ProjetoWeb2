import { useState } from "react";
import { Link } from "react-router-dom";
import CapaItem from "./CapaItem";
import { ordem, rotacao, wishlist } from "../data/rotacao";
import AdicionarItem from "./AdicionarItem";

export default function RotacaoAtual() {
  const [indice, setIndice] = useState(0);
  const atual = rotacao[ordem[indice]];

  function proxima() {
    setIndice((i) => (i + 1) % ordem.length);
  }

    const MAX = 4;
    const itens = atual.itens.slice(0, MAX);

  return (
    <>
      <p className="pb-5 pt-3 mb-10 font-menu font-bold text-[33px] text-left tracking-widest">
        {atual.rotulo}
      </p>

      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
        {itens.map((item) => (
            <CapaItem key={item.id} item={item} tipo={atual.tipo} />
        ))}

        {itens.length < MAX && (
            <AdicionarItem
            onClick={() => console.log("adicionar em", ordem[indice])}
            />
        )}
        </div>

        <button
          onClick={proxima}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-black bg-yellow-400 text-2xl font-bold text-black shadow-[3px_3px_0_0_#000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
        >
          →
        </button>
      </div>

      <div className="-mx-4 -mb-4 mt-5 flex items-center gap-3 border-t-2 border-dashed border-neutral-400 bg-neutral-100 px-4 py-3 text-black">
        <span className="font-mono text-xs uppercase">na fila</span>

        <div className="flex gap-2">
          {wishlist.slice(0, 3).map((w) => (
            <img
                key={w.id}
                src={w.imagem}
                alt={w.titulo}
                title={w.titulo}
                className="h-15 w-11 border-2 border-neutral-700 bg-neutral-300 object-cover"
            />
            ))}
        </div>

        <Link to="/wishlist" className="ml-auto font-mono text-xs underline">
          ver wishlist
        </Link>
      </div>
    </>
  );
}