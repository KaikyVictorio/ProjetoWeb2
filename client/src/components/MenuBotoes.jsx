import { NavLink } from "react-router-dom";

const itens = (base) => [
  { to: base, label: "perfil", end: true },
  { to: `${base}/favoritos`, label: "favoritos" },
  { to: `${base}/acervo`, label: "acervo" },
  { to: `${base}/logs`, label: "logs" },
  { to: `${base}/listas`, label: "listas" },
  { to: `${base}/wishlist`, label: "wishlist" },
];

export const base =
  "rounded-full border border-black px-3 py-2 font-mono text-[16px] font-bold text-black " +
  "shadow-[3px_3px_0_0_#000] transition " +
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]";

const classe = ({ isActive }) =>
  `${base} ${isActive ? "bg-[#FDD35D]" : "bg-white"}`;

const classeBotaoAcao =
  "rounded-sm border border-slate-300 px-3 py-2 font-mono uppercase text-[16px] font-bold text-white " +
  "bg-gray-700 shadow-[2px_1px_0_0_#554769] transition";

// `base` é "/perfil" (meu perfil) ou "/usuarios/:id". O botão de novo log só aparece no meu perfil.
export default function MenuBotoes({ base = "/perfil", onNovoLog }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-5">
      <nav className="flex flex-wrap gap-3">
        {itens(base).map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={classe}>
            {i.label}
          </NavLink>
        ))}
      </nav>

      {onNovoLog && (
        <button type="button" onClick={onNovoLog} className={classeBotaoAcao}>
          [+] novo log
        </button>
      )}
    </div>
  );
}