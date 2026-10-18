import Card from "../components/Card";
import { usuario } from "../data/usuario";
import MenuBotoes from "../components/MenuBotoes";

export default function Perfil() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-13 md:flex-row md:items-start">
    <aside className="w-full md:sticky md:top-4 md:w-63 md:shrink-0">
        <Card titulo="@ana_banana" className="rounded-sm shadow-[6px_0px_0_0_#171717]">
        <div className="mx-auto h-50 w-50 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
            {usuario.foto ? (
            <img
                src={usuario.foto}
                alt={`Foto de ${usuario.nome}`}
                className="h-full w-full object-cover"
            />
            ) : (
            <div className="grid h-full w-full place-items-center text-6xl font-bold text-slate-300">
                {usuario.nome[0]}
            </div>
            )}
        </div>

        <h1 className="mb-3! mt-2! text-left text-[33px]! font-bold leading-[1]!">{usuario.nome}</h1>
        <p className=" rounded-md text-left text-sm text-black">
            {usuario.bio}
        </p>

          
          <div className="mt-4 flex gap-4 text-sm">
          <div class="mx-auto flex items-center justify-center gap-4 border-t border-b border-black py-4 my-0 max-w-max">
            <span><strong>{usuario.seguidores}</strong> seguidores</span>
            <span><strong>{usuario.seguindo}</strong> seguindo</span>
          </div></div>

<dl className="mt-4 font-mono text-sm">
  {usuario.infos.map((info) => (
    <div
      key={info.rotulo}
      className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-500 py-3"
    >
      <dt className="font-bold">{info.rotulo}</dt>
      <dd className="text-right">{info.valor}</dd>
    </div>
  ))}
</dl>

          <button className="mt-4 w-full rounded bg-yellow-500 px-4 py-1 font-semibold hover:bg-gray-400">
            Editar perfil
          </button>
        </Card>
      </aside>

      {/* Coluna principal: vários cards empilhados */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <MenuBotoes />
        <Card titulo="Rotação atual">
          <p className="text-slate-300">{usuario.sobre}</p>
        </Card>

        <Card titulo="Estatísticas">
          <div className="flex flex-wrap gap-2">
            {usuario.interesses.map((i) => (
              <span
                key={i}
                className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200"
              >
                {i}
              </span>
            ))}
          </div>
        </Card>

        <Card titulo="Atividade recente">
          <p className="text-slate-400">Nenhuma atividade ainda.</p>
        </Card>
      </div>
    </div>
  );
}