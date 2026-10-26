// Logo do projeto (usado na navbar e nas telas de autenticação).
// Troque NOME_PROJETO quando a dupla definir o nome final.
export const NOME_PROJETO = "MEU PROJETO";

export default function Logo({ href = "/" }) {
  return (
    <a
      id="logo-projeto"
      href={href}
      className="inline-flex items-center gap-2 font-menu text-sm font-extrabold tracking-wide text-neutral-900"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md border-2 border-tinta bg-destaque text-xl font-black leading-none shadow-[2px_2px_0_0_#171717]"
      >
        ✱
      </span>
      {NOME_PROJETO}
    </a>
  );
}
