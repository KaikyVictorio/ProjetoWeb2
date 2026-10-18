import { NavLink } from "react-router-dom";

const itens = [
  { to: "/perfil", label: "perfil" },
  { to: "/perfil", label: "favoritos" },
  { to: "/", label: "logs" },
  { to: "/", label: "wishlist" },
];

const base =
  "rounded-lg border-2 border-black px-4 py-1.5 font-mono text-sm font-bold text-black " +
  "shadow-[4px_4px_0_0_#000] transition " +
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]";

const classe = ({ isActive }) =>
  `${base} ${isActive ? "bg-slate-300" : "bg-white"}`;

export default function MenuBotoes() {
  return (
    <nav className="flex flex-wrap gap-3 pb-2">
      {itens.map((i) => (
        <NavLink key={i.to} to={i.to} end className={classe}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}