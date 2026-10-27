import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LayoutAutenticacao from "../components/auth/LayoutAutenticacao.jsx";
import FormularioLogin from "../components/login/FormularioLogin.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ROTAS } from "../rotas.js";

export default function Login() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const local = useLocation();
  // Quem veio de uma página protegida volta para ela depois de entrar
  const destino = local.state?.de || ROTAS.home;

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <LayoutAutenticacao
      idPagina="pagina-login"
      variantePainel="login"
      tituloCard="Entrar"
      titulo="Bem-vindo de volta"
      subtitulo="o que vamos registrar hoje?"
      linkTopo={{ id: "link-topo-criar-conta", href: ROTAS.cadastro, texto: "criar conta" }}
    >
      <FormularioLogin aoEntrar={() => navigate(destino, { replace: true })} />
    </LayoutAutenticacao>
  );
}
