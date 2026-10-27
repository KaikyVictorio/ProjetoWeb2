import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, sessao } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // Se há token salvo, espera confirmar com o servidor antes de decidir o que mostrar
  const [carregando, setCarregando] = useState(() => Boolean(sessao.token()));

  useEffect(() => {
    if (!sessao.token()) return;
    api
      .get("/auth/me")
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => sessao.limpar())
      .finally(() => setCarregando(false));
  }, []);

  const sair = useCallback(() => {
    sessao.limpar();
    setUsuario(null);
  }, []);

  useEffect(() => {
    window.addEventListener("estante:sessao-expirada", sair);
    return () => window.removeEventListener("estante:sessao-expirada", sair);
  }, [sair]);

  const entrar = useCallback(async ({ email, senha, lembrarDeMim }) => {
    const resposta = await api.post("/auth/login", { email, senha });
    sessao.salvar(resposta.token, lembrarDeMim);
    setUsuario(resposta.usuario);
    return resposta;
  }, []);

  const cadastrar = useCallback(async ({ nomeUsuario, email, senha }) => {
    const resposta = await api.post("/auth/cadastro", { nome_usuario: nomeUsuario, email, senha });
    sessao.salvar(resposta.token, true);
    setUsuario(resposta.usuario);
    return resposta;
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarUsuario: setUsuario }),
    [usuario, carregando, entrar, cadastrar, sair]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
