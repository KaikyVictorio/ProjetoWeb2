import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege rotas que exigem login: quem não está logado vai para /login
// e volta para a página pedida depois de entrar.
export default function RequireAuth({ children }) {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <p className="p-10 font-mono text-sm text-neutral-500">carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname + local.search }} />;
  return children;
}
