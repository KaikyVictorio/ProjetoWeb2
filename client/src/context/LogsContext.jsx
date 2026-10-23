import { createContext, useContext, useState } from "react";
import ModalNovoLog from "../components/ModalNovoLog";
import { feed as feedInicial } from "../data/feed";
import { usuario } from "../data/usuario";

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatarData(iso) {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${meses[Number(m) - 1]}`;
}

const LogsContext = createContext(null);

export function LogsProvider({ children }) {
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
    <LogsContext.Provider
      value={{ feed, abrirModal: () => setModalAberto(true) }}
    >
      {children}
      {modalAberto && (
        <ModalNovoLog
          onClose={() => setModalAberto(false)}
          onSalvar={adicionarLog}
        />
      )}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
}