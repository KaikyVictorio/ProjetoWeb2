import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import { catalogo } from "../data/catalogo";
import { listas } from "../data/listas";
import { usuario } from "../data/usuario";

const nomeCategoria = { livro: "livro", serie: "série", jogo: "jogo" };

const limpar = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const campo =
  "w-full rounded-md border-2 border-black bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300";

const botao =
  "rounded-sm border px-3 py-2 font-mono text-sm font-bold uppercase transition hover:translate-x-[1px] hover:translate-y-[1px]";

function Formulario({ lista }) {
  const navigate = useNavigate();
  const editando = Boolean(lista);

  const [titulo, setTitulo] = useState(lista?.titulo ?? "");
  const [descricao, setDescricao] = useState(lista?.descricao ?? "");
  const [ids, setIds] = useState(lista?.obraIds ?? []); 
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const termo = limpar(busca.trim());
  const resultados = termo
    ? catalogo.filter(
        (o) => !ids.includes(o.id) && limpar(o.titulo).includes(termo)
      )
    : [];

  const escolhidas = ids
    .map((id) => catalogo.find((o) => o.id === id))
    .filter(Boolean);

  function digitar(e) {
    setBusca(e.target.value);
    setSelecionada(null);
  }

  function escolher(obra) {
    setSelecionada(obra);
    setBusca(obra.titulo);
  }

  function adicionar() {
    if (!selecionada) return;
    setIds((atual) => [selecionada.id, ...atual]);
    setSelecionada(null);
    setBusca("");
  }

  function remover(id) {
    setIds((atual) => atual.filter((x) => x !== id));
  }

  function salvar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      obraIds: ids,
    };

    if (editando) {
      Object.assign(lista, dados);
      navigate(`/listas/${lista.id}`);
    } else {
      listas.unshift({
        id: Date.now(),
        ...dados,
        autor: { usuario: usuario.usuario, foto: usuario.foto },
      });
      navigate("/perfil/listas");
    }
  }

  function excluir() {
    listas.splice(listas.indexOf(lista), 1);
    navigate("/perfil/listas");
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <Card>
        <p className="mb-5! border-b border-black pb-2 text-left font-menu font-bold text-[26px] tracking-wide">
          {editando ? "Editar lista" : "Nova lista"}
        </p>

        <form onSubmit={salvar} className="space-y-5 text-left">
          <label className="block">
            <span className="mb-1 block font-mono text-sm">Nome</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={80}
              required
              placeholder="Ex.: Jogos para zerar em um fim de semana"
              className={campo}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-mono">Descrição</span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              placeholder="Conte um pouco sobre esta lista (opcional)"
              className={`${campo} resize-none`}
            />
          </label>

          <div>
            <span className="mb-1 block font-mono text-sm">
              Obras
            </span>

            <div className="flex items-start gap-2">
              <div className="relative flex-1">
                <input
                  value={busca}
                  onChange={digitar}
                  autoComplete="off"
                  placeholder="Buscar livro, série ou jogo..."
                  className={campo}
                />

                {termo && !selecionada && (
                  <ul className="mt-1 max-h-[220px] overflow-y-auto border-2 border-black bg-white">
                    {resultados.length === 0 ? (
                      <li className="px-3 py-2 text-xs text-neutral-500">Nada encontrado.</li>
                    ) : (
                      resultados.map((o) => (
                        <li key={o.id}>
                          <button
                            type="button"
                            onClick={() => escolher(o)}
                            className="block h-9 w-full px-3 text-left text-xs hover:bg-neutral-100"
                          >
                            <strong>{o.titulo}</strong> {o.ano}{" "}
                            <span className="text-neutral-500">({nomeCategoria[o.categoria]})</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={adicionar}
                disabled={!selecionada}
                className={`${botao} border-slate-300 bg-gray-700 text-white shadow-[2px_1px_0_0_#554769] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0`}
              >
                adicionar
              </button>
            </div>

            {escolhidas.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">Nenhuma obra adicionada ainda.</p>
            ) : (
              <ul className="mt-4 divide-y divide-dashed divide-neutral-400 border-y border-neutral-400">
                {escolhidas.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 py-2">
                    <div className="h-[60px] w-10 shrink-0 overflow-hidden border border-neutral-700 bg-neutral-300">
                      {o.imagem && (
                        <img src={o.imagem} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>

                    <p className="min-w-0 flex-1 font-mono text-sm">
                      <strong>{o.titulo}</strong>{" "}
                      <span className="text-neutral-500">{o.ano}</span>
                    </p>

                    <button
                      type="button"
                      onClick={() => remover(o.id)}
                      aria-label={`Remover ${o.titulo}`}
                      className="shrink-0 p-1 text-neutral-500 transition hover:text-red-600"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className={`${botao} p-2! border-black bg-yellow-300 text-black shadow-[2px_2px_0_0_#666]`}
              >
                salvar
              </button>
              <Link
                to={editando ? `/listas/${lista.id}` : "/perfil/listas"}
                className={`${botao} p-2! border-black bg-white text-black`}
              >
                cancelar
              </Link>
            </div>

            {editando &&
              (confirmando ? (
                <span className="flex items-center gap-2 font-mono text-sm">
                  Excluir mesmo?
                  <button type="button" onClick={excluir} className={`${botao} border-black bg-red-500 text-white`}>
                    sim
                  </button>
                  <button type="button" onClick={() => setConfirmando(false)} className={`${botao} border-black bg-white text-black`}>
                    não
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  className={`${botao} border-black bg-white text-red-600 hover:bg-red-50`}
                >
                  excluir lista
                </button>
              ))}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function ListaForm() {
  const { id } = useParams();
  const lista = id ? listas.find((l) => String(l.id) === id) : null;

  if (id && (!lista || lista.autor.usuario !== usuario.usuario)) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Card>
          <p className="font-mono">Lista não encontrada.</p>
          <Link to="/listas" className="font-mono text-sm underline">voltar às listas</Link>
        </Card>
      </div>
    );
  }

  return <Formulario key={id ?? "nova"} lista={lista} />;
}