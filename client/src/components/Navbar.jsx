import { NavLink, useNavigate } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "text-black" : "text-slate-500"
  }`;

export default function Navbar() {
    const navigate = useNavigate();
    function buscar(e) {
      e.preventDefault();
      const q = new FormData(e.currentTarget).get("q").trim();
      if (q) navigate(`/busca?q=${encodeURIComponent(q)}`);
    }

  return (
    <header>
      <nav className="relative bg-[#fff] flex items-center justify-between p-4 uppercase text-black text-[16px] font-bold font-menu">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-0">
          <span>Meu Projeto</span>
          
          <div className="flex gap-3 tracking-wider">
            <NavLink to="/" end className={linkClass}>Início</NavLink>
            <NavLink to="/perfil" className={linkClass}>Meu Perfil</NavLink>
          </div>

          <form
          onSubmit={buscar}
          className="flex items-center rounded-md border-1 border-neutral-400 bg-white"
        >
          <input
            name="q"
            type="text"
            autoComplete="off"
            placeholder="Buscar obras e pessoas..."
            className="w-50 bg-transparent px-3 py-2.5 text-sm font-normal normal-case text-black outline-none placeholder:text-neutral-500"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="border-l-1 border-neutral-500 px-2 py-1.5 text-black"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>
        </div>
        <span class="absolute bottom-0 left-0 w-full h-[2px] bg-[linear-gradient(to_right,transparent,#212121,transparent)]"></span>
      </nav>
    </header>
  );
}