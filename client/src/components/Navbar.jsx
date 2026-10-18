import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header>
      <nav className="flex items-center justify-between p-5">
        <span>Meu Projeto</span>
        <div className>
          <NavLink to="/" end className={linkClass}>Início</NavLink>
          <NavLink to="/sobre" className={linkClass}>Sobre</NavLink>
        </div>
      </nav>
    </header>
  );
}