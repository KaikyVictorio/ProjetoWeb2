import { useState } from "react";
import { Link } from "react-router-dom";
import { formatarData } from "../utils/data";

function Estrelas({ nota }) {
  return (
    <span className="whitespace-nowrap text-xl leading-none text-yellow-600">
      {"★".repeat(Math.floor(nota))}
      {nota % 1 !== 0 && "½"}
    </span>
  );
}

const acoes = {
  lendo: "está lendo",
  assistindo: "está assistindo",
  jogando: "está jogando",
};

const botaoAcao =
  "rounded-sm border border-neutral-500 px-2 py-0.5 font-mono text-xs uppercase transition hover:bg-neutral-100";

// Editar/excluir (só aparecem nos logs da própria pessoa)
function AcoesLog({ onEditar, onExcluir }) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <span className="flex items-center gap-2 font-mono text-xs">
        Excluir mesmo?
        <button type="button" onClick={onExcluir} className={`${botaoAcao} border-black bg-red-500 text-white hover:bg-red-600`}>
          sim
        </button>
        <button type="button" onClick={() => setConfirmando(false)} className={botaoAcao}>
          não
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button type="button" onClick={onEditar} className={botaoAcao}>
        editar
      </button>
      <button type="button" onClick={() => setConfirmando(true)} className={`${botaoAcao} text-red-700`}>
        excluir
      </button>
    </span>
  );
}

function Usuario({ item }) {
  return item.usuarioId ? (
    <Link to={`/usuarios/${item.usuarioId}`} className="font-bold hover:underline">
      @{item.usuario}
    </Link>
  ) : (
    <span className="font-bold">@{item.usuario}</span>
  );
}

// `mostrarUsuario`: mostra quem escreveu a review (útil na home)
// `onEditar` / `onExcluir`: passe só para logs da própria pessoa
export default function ItemFeed({ item, mostrarUsuario = false, onEditar, onExcluir }) {
  const acoesLog = onEditar && onExcluir && (
    <AcoesLog onEditar={() => onEditar(item)} onExcluir={() => onExcluir(item)} />
  );

  if (item.tipo === "review") {
    return (
      <li className="flex gap-4 py-5">
        <Link
          to={`/obras/${item.obra.id}`}
          className="block h-32 w-22 shrink-0 overflow-hidden border-2 border-neutral-800 bg-neutral-300"
        >
          {item.obra.imagem && (
            <img
              src={item.obra.imagem}
              alt={`Capa de ${item.obra.titulo}`}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </Link>

        <div className="min-w-0 flex-1 text-left">
          {mostrarUsuario && (
            <p className="mb-1 font-mono text-sm text-neutral-600">
              <Usuario item={item} /> escreveu
            </p>
          )}
          <p className="font-mono font-bold">
            <Link to={`/obras/${item.obra.id}`} className="hover:underline">
              {item.obra.titulo}
            </Link>{" "}
            <span className="font-normal text-neutral-600">{item.obra.ano}</span>
          </p>
          {item.nota > 0 && <Estrelas nota={item.nota} />}
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-800">
            {item.spoiler ? <span className="font-mono text-xs uppercase text-neutral-500">[contém spoilers] </span> : null}
            {item.texto}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm text-neutral-700">{formatarData(item.data)}</p>
            {acoesLog}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-6">
      <p className="min-w-0 text-sm">
        <Usuario item={item} />{" "}
        {item.tipo === "terminou" ? "terminou" : acoes[item.acao]}{" "}
        <Link to={`/obras/${item.obra.id}`} className="font-bold hover:underline">
          {item.obra.titulo}
        </Link>
      </p>

      <div className="flex shrink-0 items-center gap-3">
        {item.tipo === "terminou" && item.nota > 0 && <Estrelas nota={item.nota} />}
        <span className="font-mono text-sm text-neutral-700">{formatarData(item.data)}</span>
        {acoesLog}
      </div>
    </li>
  );
}
