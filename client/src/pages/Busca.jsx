import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import Paginacao from "../components/Paginacao";
import TagTipo from "../components/TagTipo";
import { catalogo } from "../data/catalogo";
import { usuarios } from "../data/usuarios";

const POR_PAGINA = 10;

const limpar = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const abas = [
  { id: "obras", label: "Obras" },
  { id: "usuarios", label: "Usuários" },
];

export default function Busca() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const termo = (params.get("q") || "").trim();

  const [aba, setAba] = useState("obras");
  const [pagina, setPagina] = useState(1);

  const t = limpar(termo);

  const obras = useMemo(
    () => (t ? catalogo.filter((o) => limpar(o.titulo).includes(t)) : []),
    [t]
  );
  const pessoas = useMemo(
    () =>
      t
        ? usuarios.filter(
            (u) => limpar(u.nome).includes(t) || limpar(u.usuario).includes(t)
          )
        : [],
    [t]
  );

  const contagem = { obras: obras.length, usuarios: pessoas.length };
  const lista = aba === "obras" ? obras : pessoas;

  const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const atual = Math.min(pagina, total);
  const visiveis = lista.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);

  function buscar(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q").trim();
    if (q) {
      setPagina(1);
      navigate(`/busca?q=${encodeURIComponent(q)}`);
    }
  }

  function trocarAba(id) {
    setAba(id);
    setPagina(1);
  }

  function mudarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let mensagem;
  if (!termo) mensagem = "Digite algo na busca para encontrar obras e pessoas.";
  else if (lista.length === 0)
    mensagem = `Nenhum resultado em ${aba === "obras" ? "obras" : "usuários"} para "${termo}".`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 ">
        <form
          key={termo}
          onSubmit={buscar}
          className="flex items-center gap-3 border-b-1 border-black pb-3"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            name="q"
            type="text"
            autoComplete="off"
            defaultValue={termo}
            placeholder="Buscar obras e pessoas..."
            className="w-full bg-transparent font-mono text-lg outline-none placeholder:text-neutral-500"
          />
        </form>

        {termo && (
          <nav className="mt-4 flex gap-6 pb-3 font-mono text">
            {abas.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => trocarAba(a.id)}
                className={`flex items-center gap-2 uppercase tracking-wide transition ${
                  aba === a.id ? "font-bold text-black" : "text-neutral-500 hover:text-black"
                }`}
              >
                {a.label}
                <span className={aba === a.id ? "font-bold" : ""}>{contagem[a.id]}</span>
              </button>
            ))}
          </nav>
        )}

        <p className="mt-5 font-mono text-sm text-neutral-600">{mensagem}</p>

        <ul className="mt-5 divide-y divide-dashed divide-neutral-400">
          {aba === "obras"
            ? visiveis.map((o) => (
                <li key={o.id} className="flex items-center gap-4 py-4 transition hover:translate-x-1 ">
                  <div className="h-24 w-16 shrink-0 overflow-hidden border-1 border-neutral-800 bg-neutral-300">
                    {o.imagem && (
                      <img src={o.imagem} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={`/obras/${o.id}`} className="font-menu text-xl font-bold">
                        {o.titulo}{" "}
                        <span className="font-normal text-lg text-neutral-500">{o.ano}</span>
                      </Link>
                      <TagTipo tipo={o.categoria} />
                    </div>
                  </div>
                </li>
              ))
            : visiveis.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/usuarios/${u.id}`}
                    className="flex items-center gap-4 py-4 transition hover:translate-x-1"
                  >
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-neutral-700 bg-slate-700 text-2xl font-bold text-slate-300">
                      {u.foto ? (
                        <img src={u.foto} alt={`Foto de ${u.nome}`} className="h-full w-full object-cover" />
                      ) : (
                        u.nome[0]
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-menu text-lg font-bold">{u.nome}</p>
                      <p className="font-mono text-sm text-neutral-500">@{u.usuario}</p>
                    </div>
                  </Link>
                </li>
              ))}
        </ul>

        <Paginacao pagina={atual} total={total} onChange={mudarPagina} />
    </div>
  );
}