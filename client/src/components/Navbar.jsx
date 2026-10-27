import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { usuario } from "../data/usuario";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "text-black" : "text-neutral-500 hover:text-black"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const inputRef = useRef(null);
  const timerMenu = useRef(null);

  function abrirMenu() {
    clearTimeout(timerMenu.current);
    setMenuAberto(true);
  }

  function fecharMenu() {
    timerMenu.current = setTimeout(() => setMenuAberto(false), 150);
  }

  useEffect(() => {
    if (buscaAberta) inputRef.current?.focus();
  }, [buscaAberta]);

  useEffect(() => {
    function esc(e) {
      if (e.key === "Escape") {
        setMenuAberto(false);
        setBuscaAberta(false);
      }
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  function buscar(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q").trim();
    if (q) {
      navigate(`/busca?q=${encodeURIComponent(q)}`);
      setBuscaAberta(false);
    }
  }

  const itemMenu =
    "block w-full px-4 py-2.5 text-left text-sm font-bold uppercase tracking-wide transition hover:bg-neutral-100";

  return (
    <header>
      <nav className="relative bg-white p-2 text-[16px] font-bold uppercase text-black font-menu">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">

          {/* esquerda */}
          <div className="min-w-0 text-left">
            <Link to="/" aria-label="Página inicial" className="inline-block">
              <img src="/estante virtual.png" alt="Estante Virtual" className="h-10 w-auto" />
            </Link>
          </div>

          {/* centro */}
          <div
            className={`flex gap-2 whitespace-nowrap tracking-wider transition-opacity duration-300 ${
              buscaAberta ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            
            <NavLink to="/listas" className={linkClass}>Listas</NavLink>
            <NavLink to="/perfil" className={linkClass}>Meu Perfil</NavLink>
          </div>

          {/* direita */}
          <div className="flex min-w-0 items-center justify-end gap-3">
            <form
              onSubmit={buscar}
              style={{ width: buscaAberta ? "min(380px, 40vw)" : 40 }}
              className={`flex h-10 shrink-0 items-center justify-end overflow-hidden rounded-full border transition-all duration-300 ease-in-out ${
                buscaAberta ? "border-neutral-400" : "border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => setBuscaAberta(false)}
                aria-label="Fechar busca"
                tabIndex={buscaAberta ? 0 : -1}
                className={`grid h-10 w-9 shrink-0 place-items-center text-neutral-500 transition-opacity duration-300 hover:text-black ${
                  buscaAberta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              <input
                ref={inputRef}
                name="q"
                type="text"
                autoComplete="off"
                tabIndex={buscaAberta ? 0 : -1}
                placeholder="Buscar obras e pessoas..."
                className={`min-w-0 flex-1 bg-transparent px-1 text-sm font-normal normal-case text-black outline-none placeholder:text-neutral-500 transition-opacity duration-300 ${
                  buscaAberta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              />

              <button
                type={buscaAberta ? "submit" : "button"}
                onClick={() => !buscaAberta && setBuscaAberta(true)}
                aria-label="Buscar"
                className="grid h-10 w-10 shrink-0 place-items-center text-black"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </form>

            <div
              className="relative shrink-0"
              onMouseEnter={abrirMenu}
              onMouseLeave={fecharMenu}
              onFocus={abrirMenu}
              onBlur={fecharMenu}
            >
              <Link to="/perfil" className="flex items-center gap-2 tracking-wider">
                <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-400 bg-slate-700 text-sm text-slate-200">
                  {usuario.foto ? (
                    <img src={usuario.foto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    usuario.nome[0]
                  )}
                </span>
                <span>{usuario.usuario}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform duration-200 ${menuAberto ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Link>

              {menuAberto && (
                <div className="absolute right-0 top-full z-50 pt-3">
                  <div
                    role="menu"
                    className="w-40 overflow-hidden rounded-lg border-1 border-neutral-500 bg-white shadow-[2px_2px_0_0_#666]"
                  >
                    <Link to="/perfil" role="menuitem" onClick={() => setMenuAberto(false)} className={itemMenu}>
                      Editar perfil
                    </Link>
                    <Link
                      to="/configuracoes"
                      role="menuitem"
                      onClick={() => setMenuAberto(false)}
                      className={`${itemMenu} border-t border-neutral-400`}
                    >
                      Configurações
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuAberto(false);
                        navigate("/login");
                      }}
                      className={`${itemMenu} text-red-700 border-t border-neutral-400`}
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[linear-gradient(to_right,transparent,#212121,transparent)]"></span>
      </nav>
    </header>
  );
}