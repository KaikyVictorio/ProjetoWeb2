/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalNovoLog from "../components/ModalNovoLog";
import { api } from "../api";
import { hojeISO } from "../utils/data";
import { useAuth } from "./AuthContext";

const LogsContext = createContext(null);

// Controla o modal de log (criar/editar) para o app inteiro.
// `versao` aumenta a cada log salvo: as telas que listam logs usam isso
// para buscar os dados de novo.
export function LogsProvider({ children }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // { obra?, log? }
  const [versao, setVersao] = useState(0);

  const notificar = useCallback(() => setVersao((v) => v + 1), []);

  const abrirModal = useCallback(
    (obra = null) => {
      if (!usuario) return navigate("/login");
      setModal({ obra });
    },
    [usuario, navigate]
  );

  const editarLog = useCallback((log) => setModal({ log }), []);

  async function salvar({ obra, jaFeito, texto, spoiler, nota }) {
    if (modal.log) {
      await api.put(`/logs/${modal.log.id}`, { nota, texto, spoiler, jaFeito });
    } else {
      await api.post("/logs", { obraId: obra.id, nota, texto, spoiler, jaFeito, data: hojeISO() });
    }
    notificar();
  }

  const value = useMemo(
    () => ({ versao, abrirModal, editarLog, notificar }),
    [versao, abrirModal, editarLog, notificar]
  );

  return (
    <LogsContext.Provider value={value}>
      {children}
      {modal && (
        <ModalNovoLog
          obraInicial={modal.obra}
          logInicial={modal.log}
          onClose={() => setModal(null)}
          onSalvar={salvar}
        />
      )}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
}
