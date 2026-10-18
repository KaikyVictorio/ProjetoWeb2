import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "text-black" : "text-slate-500"
  }`;

export default function Navbar() {
  return (
    <header>
      <nav className="relative bg-gray-800 flex items-center justify-between p-5 text-white">
        
        <span>Meu Projeto</span>
        <div className>
          <NavLink to="/" end className={linkClass}>Início</NavLink>
          <NavLink to="/sobre" className={linkClass}>Sobre</NavLink>
        </div>
        <span class="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-500 via-blue-500 to-transparent"></span>
      </nav>
    </header>
  );
}