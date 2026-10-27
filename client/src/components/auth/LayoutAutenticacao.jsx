import { Link } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import CardJanela from "../ui/CardJanela.jsx";
import PainelBoasVindas from "./PainelBoasVindas.jsx";

// Estrutura comum das telas de login e cadastro:
// barra do topo + painel de boas-vindas (esquerda) + card do formulário (direita).
//
// Props:
// - idPagina: id do container da página (ex.: "pagina-login")
// - tituloCard: texto da barra do card (ex.: "Entrar")
// - titulo / subtitulo: cabeçalho dentro do card
// - linkTopo: { id, href, texto } do link no canto direito da barra
// - variantePainel: "login" | "cadastro" (muda o texto do painel)
export default function LayoutAutenticacao({
  idPagina,
  tituloCard,
  titulo,
  subtitulo,
  linkTopo,
  variantePainel = "login",
  children,
}) {
  return (
    <div id={idPagina} className="fundo-pontilhado flex min-h-screen flex-col text-left font-mono text-neutral-900">
      <header id={`barra-topo-${variantePainel}`} className="border-b-2 border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          {linkTopo && (
            <Link
              id={linkTopo.id}
              to={linkTopo.href}
              className="font-menu text-sm font-bold uppercase tracking-wide hover:underline hover:decoration-destaque hover:decoration-4 hover:underline-offset-4"
            >
              {linkTopo.texto}
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <PainelBoasVindas variante={variantePainel} />

        <CardJanela id={`card-${variantePainel}`} titulo={tituloCard} className="mx-auto w-full max-w-md">
          <div className="mb-6 flex flex-col gap-1">
            <h2 id={`titulo-${variantePainel}`} className="m-0! text-2xl! font-bold! tracking-normal!">
              <span className="marca-texto">{titulo}</span>
            </h2>
            {subtitulo && <p className="text-sm text-neutral-500">{subtitulo}</p>}
          </div>

          {children}
        </CardJanela>
      </main>
    </div>
  );
}
