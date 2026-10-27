import { useState } from "react";
import { Outlet } from "react-router-dom";
import Card from "../components/Card";
import MenuBotoes from "../components/MenuBotoes";
import ModalNovoLog from "../components/ModalNovoLog";
import { usuario } from "../data/usuario";
import { feed as feedInicial } from "../data/feed";

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatarData(iso) {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${meses[Number(m) - 1]}`;
}

export default function Perfil() {
  const [feed, setFeed] = useState(feedInicial);
  const [modalAberto, setModalAberto] = useState(false);

  function adicionarLog({ obra, data, texto, spoiler, nota }) {
    const base = {
      id: Date.now(),
      data: formatarData(data),
      obra: { titulo: obra.titulo, ano: obra.ano, categoria: obra.categoria, imagem: obra.imagem },
      nota,
    };
    const novo = texto
      ? { ...base, tipo: "review", texto, spoiler }
      : { ...base, tipo: "terminou", usuario: usuario.usuario };
    setFeed((f) => [novo, ...f]);
  }

  return (
    <div className="bg-cover bg-center bg-fixed bg-repeat bg-size-[170px]"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/79/1e/78/791e78da281e281ddbb3a27929943f0b.jpg')" }}>
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-13 md:flex-row md:items-start">
      <aside className="w-full md:sticky md:top-4 md:w-63 md:shrink-0 space-y-6">
        <Card className="rounded-xl outline outline-1 outline-offset-1 outline-slate-500 shadow-[5px_2px_0_0_#424242]">
          <div className="mx-auto h-45 w-45 overflow-hidden rounded-full border border-slate-400 outline outline-1 outline-offset-4 outline-slate-200 bg-slate-700">
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

          <h1 className="mb-0! mt-2! text-[27px]! font-bold font-menu! leading-[1]!">{usuario.nome}</h1>
          <h3 className="mb-3 font-menu! text-[17px] text-neutral-700">@{usuario.usuario}</h3>
          <p className="font-menu text-left text-sm text-black">{usuario.bio}</p>

          <dl className="mt-3 font-mono text-sm">
            {usuario.infos.map((info) => (
              <div
                key={info.rotulo}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-400 py-3"
              >
                <dt className="font-bold">{info.rotulo}</dt>
                <dd className="text-right">{info.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex gap-4 text-[17px]">
            <div className="mx-auto flex items-center justify-center gap-4 rounded-xl bg-gray-100 border-t border-b border-slate-300 px-6 py-2 my-0 max-w-max font-menu">
              <span className="text-sm"><strong className="text-lg">{usuario.seguidores}</strong> seguidores</span>
              <span className="text-sm"><strong className="text-lg">{usuario.seguindo}</strong> seguindo</span>
            </div>
          </div>

          <button className="mt-4 rounded-lg bg-gray-700 px-13 py-2 font-semibold hover:bg-gray-700 tracking-wide text-white text-sm">
            Editar perfil
          </button>
        </Card>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <MenuBotoes onNovoLog={() => setModalAberto(true)} />
        <Outlet context={{ feed }} />

        {modalAberto && (
          <ModalNovoLog
            onClose={() => setModalAberto(false)}
            onSalvar={adicionarLog}
          />
        )}
      </div>
    </div>
    </div>
  );
}