import { useState } from "react";
import Card from "../../components/Card";
import CapaItem from "../../components/CapaItem";
import FiltroBotao from "../../components/FiltroBotao";
import { logs } from "../../data/logs";
import { usuario } from "../../data/usuario";

const filtros = [
  { tipo: "livro", label: "livro", cor: "#a284da" },
  { tipo: "serie", label: "série", cor: "#f6d57b" },
  { tipo: "jogo", label: "jogo", cor: "#65dbeb" },
];

export default function PerfilAcervo() {
  const [filtro, setFiltro] = useState(null);

  const visiveis = filtro ? logs.filter((l) => l.tipo === filtro) : logs;

  function alternar(tipo) {
    setFiltro((atual) => (atual === tipo ? null : tipo));
  }

  return (
    <Card titulo="Biblioteca de {@usuario.nome}">
      <div className="mb-5 flex flex-wrap justify-end gap-3">
        {filtros.map((f) => (
          <FiltroBotao
            key={f.tipo}
            ativo={filtro === f.tipo}
            cor={f.cor}
            onClick={() => alternar(f.tipo)}
          >
            {f.label}
          </FiltroBotao>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="text-slate-400">Nenhuma obra nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
          {visiveis.map((item) => (
            <CapaItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}