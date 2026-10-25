import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import TagTipo from "../components/TagTipo";
import Avaliacao from "../components/Avaliacao";
import { catalogo } from "../data/catalogo";
import { reviews } from "../data/reviews";

const POR_LOTE = 10;

const cores = { livro: "#7A81E1", serie: "#b8941f", jogo: "#2aa7b8" };
const credito = { livro: "Escrito por", serie: "Criada por", jogo: "Desenvolvido por" };

function Icone({ nome }) {
  const props = {
    viewBox: "0 0 24 24",
    className: "h-7 w-7",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (nome === "log")
    return (
      <svg {...props}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  if (nome === "favorito")
    return (
      <svg {...props}>
        <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function BotaoRapido({ nome, rotulo, ativo, cor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className="flex flex-1 flex-col items-center gap-1 py-3 font-mono text-xs transition hover:bg-neutral-200"
      style={ativo ? { color: cor } : undefined}
    >
      <Icone nome={nome} />
      {rotulo}
    </button>
  );
}

function ReviewItem({ r }) {
  const [revelado, setRevelado] = useState(false);

  return (
    <li className="flex gap-4 py-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-neutral-700 bg-slate-700 font-bold text-slate-300">
        {r.foto ? <img src={r.foto} alt="" className="h-full w-full object-cover" /> : r.usuario[0].toUpperCase()}
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span className="text-neutral-600">Review de</span>
          <strong>@{r.usuario}</strong>
          {r.nota > 0 && <Avaliacao nota={r.nota} tamanho={22} />}
        </p>

        {r.spoiler && !revelado ? (
          <button
            type="button"
            onClick={() => setRevelado(true)}
            className="mt-2 rounded-md border-2 border-dashed border-neutral-500 px-3 py-1 font-mono text-xs uppercase text-neutral-600 hover:bg-neutral-100"
          >
            contém spoilers · mostrar
          </button>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-neutral-800">{r.texto}</p>
        )}
      </div>
    </li>
  );
}

function ObraConteudo({ id }) {
  const obra = catalogo.find((o) => String(o.id) === id);
  const [notaMinha, setNotaMinha] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [mostrando, setMostrando] = useState(POR_LOTE);

  if (!obra) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <Card>
          <p className="font-mono">Obra não encontrada.</p>
          <Link to="/" className="font-mono text-sm underline">voltar ao início</Link>
        </Card>
      </div>
    );
  }

  const cor = cores[obra.categoria];
  const daObra = reviews.filter((r) => r.obraId === obra.id);
  const notas = daObra.filter((r) => r.nota > 0);
  const media = notas.length
    ? notas.reduce((s, r) => s + r.nota, 0) / notas.length
    : null;

  return (
        <div className="bg-cover bg-center bg-fixed bg-repeat bg-size-[170px]"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/79/1e/78/791e78da281e281ddbb3a27929943f0b.jpg')" }}>
    <div className="mx-auto w-full max-w-5xl px- py-5">
      <Card titulo="🎮">
        <div className="p-7 grid gap-x-10 gap-y-10 md:grid-cols-[250px_1fr_250px]">

          <div className="mx-auto w-[200px] md:row-span-2 md:mx-0">
            <div className="rounded-lg relative h-[370px] w-[250px] overflow-hidden border-2 border-neutral-800 bg-neutral-300 shadow-[4px_4px_0_0_#000]">
              <span className="absolute inset-0 grid place-items-center font-mono text-xs uppercase text-neutral-500">
                sem capa
              </span>
              {obra.imagem && (
                <img
                  src={obra.imagem}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>
          </div>

          <div className="min-w-0 text-left">
            <h1
              className="cursor-default  font-bold transition-colors duration-300 hover:text-(--cor)"
              style={{ "--cor": cor, fontSize: 45, lineHeight: 1.1, margin: 1, }}
            >
              {obra.titulo}
            </h1>

            <p className="mt-3! flex flex-wrap items-center gap-5 font-menu">
              <TagTipo tipo={obra.categoria} />
              <span className="text-neutral-600">{obra.ano}</span>
              <span>
                <span className="text-neutral-600">{credito[obra.categoria]} </span>
                <strong>{obra.autor}</strong>
              </span>
            </p>

            <p className="text-justify font-menu text-base leading-relaxed text-neutral-800">{obra.sinopse}</p>

            {obra.generos?.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {obra.generos.map((g) => (
                  <li
                    key={g}
                    className="rounded-full border-2 border-neutral-500 bg-white px-3 py-0.5 font-mono text-xs uppercase"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}

            
          </div>

          <div className="rounded-xl self-center border-1 border-neutral-500 bg-[radial-gradient(ellipse_at_center,#f0f0f0_35%,#fff_100%)] shadow-[2px_1px_0_0_#333]">
            <div className="flex divide-x-1 divide-neutral-500 border-b-1 border-neutral-400">
              <BotaoRapido
                nome="log"
                rotulo="Logar"
                cor={cor}
                onClick={() => console.log("abrir novo log para", obra.titulo)}
              />
              <BotaoRapido
                nome="favorito"
                rotulo="Favoritar"
                ativo={favorito}
                cor={cor}
                onClick={() => setFavorito((v) => !v)}
              />
              <BotaoRapido
                nome="wishlist"
                rotulo="Wishlist"
                ativo={wishlist}
                cor={cor}
                onClick={() => setWishlist((v) => !v)}
              />
            </div>

            <div className="flex flex-col items-center gap-1 px-3 py-4">
              <p className="font-mono text-sm uppercase text-neutral-900">
                Sua nota {notaMinha > 0 && `· ${notaMinha}`}
              </p>
              <Avaliacao valor={notaMinha} onChange={setNotaMinha} tamanho={36} />
            </div>
          </div>

          <section className="mt-15 md:col-span-3 md:col-start-1">
            <h2 className="border-b border-neutral-500 pb-2 text-left text-[20px]! uppercase !tracking-wider">
              Reviews recentes
            </h2>

            {daObra.length === 0 ? (
              <p className="py-6 text-left text-sm text-neutral-700">Ainda não há reviews desta obra.</p>
            ) : (
              <ul className="p-4 divide-y  divide-neutral-200">
                {daObra.slice(0, mostrando).map((r) => (
                  <ReviewItem key={r.id} r={r} />
                ))}
              </ul>
            )}

            {mostrando < daObra.length && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setMostrando((n) => n + POR_LOTE)}
                  className="rounded-xl border border-black bg-white px-4 py-1 font-mono text-[15px] font-bold uppercase tracking-wide transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]"
                >
                  carregar mais
                </button>
              </div>
            )}
          </section>
        </div>
      </Card>
    </div>
    </div>
  );
}

export default function Obra() {
  const { id } = useParams();
  return <ObraConteudo key={id} id={id} />;
}