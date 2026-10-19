import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "text-black" : "text-slate-500"
  }`;

export default function Navbar() {
  return (
    <header>
      <nav className="relative bg-[#fff] flex items-center justify-between p-4 uppercase text-black text-[16px] font-bold font-menu">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-0">
          <span>Meu Projeto</span>
          <div className="flex gap-2">
            <NavLink to="/" end className={linkClass}>Início</NavLink>
            <NavLink to="/perfil" className={linkClass}>Meu Perfil</NavLink>
          </div>
        </div>
        <span class="absolute bottom-0 left-0 w-full h-[3px] bg-[linear-gradient(to_right,transparent,#eab308,transparent)]"></span>
      </nav>
    </header>
  );
}