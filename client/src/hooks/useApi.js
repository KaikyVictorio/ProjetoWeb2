import { useCallback, useEffect, useRef, useState } from "react";

// Carrega dados da API e refaz a busca quando `deps` mudam ou `recarregar()` é chamado.
//   const { dados, carregando, erro, recarregar } = useApi(() => api.get("/obras"), []);
// Enquanto recarrega, mantém os dados antigos na tela (sem piscar).
export function useApi(carregar, deps = []) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState({ dados: null, erro: "", chave: null });
  const funcao = useRef(carregar);
  useEffect(() => {
    funcao.current = carregar;
  });

  // Identifica a busca atual; "carregando" é quando o resultado guardado é de outra busca
  const chave = JSON.stringify([...deps, versao]);

  useEffect(() => {
    let cancelado = false;
    funcao
      .current()
      .then((dados) => !cancelado && setEstado({ dados, erro: "", chave }))
      .catch((erro) => !cancelado && setEstado({ dados: null, erro: erro.message, chave }));
    return () => {
      cancelado = true;
    };
  }, [chave]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  const carregando = estado.chave !== chave;
  return { dados: estado.dados, erro: carregando ? "" : estado.erro, carregando, recarregar };
}
