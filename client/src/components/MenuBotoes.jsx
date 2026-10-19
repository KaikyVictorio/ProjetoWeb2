import { NavLink } from "react-router-dom";

const itens = [
  { to: "/perfil", label: "perfil" },
  { to: "/", label: "favoritos" },
  { to: "/", label: "logs" },
  { to: "/", label: "wishlist" },
];

const base =
  "rounded-full border border-black px-4 py-2 font-mono text-[16px] font-bold text-black " +
  "shadow-[3px_3px_0_0_#000] transition " +
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]";

const classe = ({ isActive }) =>
  `${base} ${isActive ? "bg-[#FDD35D]" : "bg-white"}`;

const classeBotaoAcao =
  "rounded border border-slate-300 px-3 py-2 font-mono uppercase text-[16px] font-bold text-black " +
  "bg-[#f5f5ff] shadow-[2px_1px_0_0_#554769] transition ";

export default function MenuBotoes({ onNovoLog = () => {} }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-5">
      <nav className="flex flex-wrap gap-3">
        {itens.map((i) => (
          <NavLink key={i.to} to={i.to} end className={classe}>
            {i.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onNovoLog}
        className={classeBotaoAcao}
      >
        [+] novo log
      </button>
    </div>
  );
}