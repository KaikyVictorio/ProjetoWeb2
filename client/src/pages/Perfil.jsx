import Card from "../components/Card";
import { usuario } from "../data/usuario";
import MenuBotoes from "../components/MenuBotoes";
import RotacaoAtual from "../components/RotacaoAtual";
import Estatisticas from "../components/Estatisticas";

export default function Perfil() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-13 md:flex-row md:items-start">
    <aside className="w-full md:sticky md:top-4 md:w-66 md:shrink-0">
        <Card  className="rounded-xl outline outline-1 outline-offset-1 outline-slate-700 shadow-[6px_2px_0_0_#333333]">
        <div className="mx-auto h-50 w-50 overflow-hidden rounded-full border border-slate-600 outline outline-1 outline-offset-4 outline-slate-200 bg-slate-700">
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

        <h1 className="mb-0! mt-2! text-[29px]! font-bold font-menu! leading-[1]!">{usuario.nome}</h1>
        <h3 className="mb-3 font-menu! text-[17px] text-neutral-700">@{usuario.usuario}</h3>
        <p className=" rounded-md text-left text-sm text-black ">
            {usuario.bio}
        </p>

          
          <div className="mt-4 flex gap-4 text-[17px]">
          <div class="mx-auto flex items-center justify-center gap-4 border-t border-b border-slate-300 py-4 my-0 max-w-max">
            <span><strong className="text-[20px]">{usuario.seguidores}</strong> seguidores</span>
            <span><strong className="text-[20px]">{usuario.seguindo}</strong> seguindo</span>
          </div></div>

<dl className="mt-1 font-mono text-sm">
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
          <button className="mt-4 rounded-lg bg-gray-800 px-13 py-2 font-semibold hover:bg-gray-700 tracking-wide text-white text-sm">
            Editar perfil
          </button>
        </Card>
      </aside>

      {/* Coluna principal: vários cards empilhados */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <MenuBotoes />
        <Card titulo="Rotação atual" className="">
          <RotacaoAtual />
        </Card>

        <div className="grid items-start gap-5 md:grid-cols-[2fr_1fr]">
        <Card titulo="Atividade recente">
          <p className="text-slate-400">Nenhuma atividade ainda.</p>
        </Card>

        <Card titulo="Estatísticas">
          <Estatisticas />
          <div className="flex flex-wrap gap-2">
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}