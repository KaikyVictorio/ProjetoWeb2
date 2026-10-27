import Logo from "../components/ui/Logo.jsx";
import { ROTAS } from "../rotas.js";

// Página provisória para links que ainda não têm tela.
export default function PaginaTemporaria({ titulo }) {
  return (
    <div className="fundo-pontilhado flex min-h-screen flex-col">
      <header className="border-b-2 border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-4 px-4 sm:px-6">
        <h1 className="text-3xl font-bold">
          <span className="marca-texto">{titulo}</span>
        </h1>
        <p className="text-sm text-neutral-500">Esta página ainda não foi feita.</p>
        <div className="flex gap-3">
          <a href={ROTAS.login} className="botao-retro bg-destaque">ir para o login</a>
          <a href={ROTAS.cadastro} className="botao-retro bg-white">ir para o cadastro</a>
        </div>
      </main>
    </div>
  );
}
