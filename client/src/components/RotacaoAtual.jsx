import { useState } from "react";
import { Link } from "react-router-dom";
import CapaItem from "./CapaItem";
import AdicionarItem from "./AdicionarItem";
import ModalBuscaObra from "./ModalBuscaObra";
import { api } from "../api";
import { MAX_ROTACAO, ordemRotacao, rotacaoInfo } from "../constants";

// rotacao: { lendo: [], jogando: [], assistindo: [] }   fila: primeiras obras da wishlist
// `editavel` só no meu perfil: libera adicionar e remover
export default function RotacaoAtual({ rotacao, fila, base, editavel, onMudou }) {
  const [indice, setIndice] = useState(0);
  const [escolhendo, setEscolhendo] = useState(false);
  const [erro, setErro] = useState("");

  const acao = ordemRotacao[indice];
  const info = rotacaoInfo[acao];
  const itens = rotacao[acao].slice(0, MAX_ROTACAO);

  function proxima() {
    setErro("");
    setIndice((i) => (i + 1) % ordemRotacao.length);
  }

  async function mudar(operacao) {
    setErro("");
    try {
      await operacao();
      onMudou();
    } catch (e) {
      setErro(e.message);
    }
  }

  const adicionar = (obra) => {
    setEscolhendo(false);
    mudar(() => api.post("/me/rotacao", { obraId: obra.id }));
  };
  const remover = (obra) => mudar(() => api.delete(`/me/rotacao/${obra.id}`));

  return (
    <>
      <p className="pb-5 pt-3 mb-10 font-menu font-bold text-[33px] text-left tracking-widest">{info.rotulo}</p>

      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          {itens.map((item) => (
            <CapaItem key={item.id} item={item} onRemover={editavel ? () => remover(item) : undefined} />
          ))}

          {editavel && itens.length < MAX_ROTACAO && <AdicionarItem onClick={() => setEscolhendo(true)} />}
        </div>

        <button
          type="button"
          onClick={proxima}
          aria-label="Próxima categoria"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-black bg-yellow-400 text-2xl font-bold text-black shadow-[3px_3px_0_0_#000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
        >
          →
        </button>
      </div>

      {!editavel && itens.length === 0 && <p className="text-left text-sm text-slate-400">Nada por aqui ainda.</p>}
      {erro && (
        <p role="alert" className="mt-3 text-left text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="-mx-4 -mb-4 mt-5 flex items-center gap-3 border-t-2 border-dashed border-neutral-400 bg-neutral-100 px-4 py-3 text-black">
        <span className="font-mono text-xs uppercase">na fila</span>

        <div className="flex gap-2">
          {fila.length === 0 && <span className="font-mono text-xs text-neutral-500">vazia</span>}
          {fila.map((w) =>
            w.imagem ? (
              <img
                key={w.id}
                src={w.imagem}
                alt={w.titulo}
                title={w.titulo}
                className="h-15 w-11 border-2 border-neutral-700 bg-neutral-300 object-cover"
              />
            ) : (
              <span
                key={w.id}
                title={w.titulo}
                className="grid h-15 w-11 place-items-center border-2 border-neutral-700 bg-neutral-300 text-center font-mono text-[9px] leading-tight"
              >
                {w.titulo.slice(0, 12)}
              </span>
            )
          )}
        </div>

        <Link to={`${base}/wishlist`} className="ml-auto font-mono text-xs underline">
          ver wishlist
        </Link>
      </div>

      {escolhendo && (
        <ModalBuscaObra
          titulo={`Adicionar a "${info.rotulo.toLowerCase()}"`}
          categoria={info.tipo}
          ocultarIds={rotacao[acao].map((o) => o.id)}
          onEscolher={adicionar}
          onClose={() => setEscolhendo(false)}
        />
      )}
    </>
  );
}
