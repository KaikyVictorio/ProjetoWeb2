import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LayoutAutenticacao from "../components/auth/LayoutAutenticacao.jsx";
import FormularioCadastro from "../components/cadastro/FormularioCadastro.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ROTAS } from "../rotas.js";

function CadastroConteudo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  // Só vale quem JÁ estava logado ao abrir a página; quem acabou de criar a conta segue para o perfil
  const [jaLogado] = useState(Boolean(usuario));

  if (jaLogado) return <Navigate to={ROTAS.home} replace />;

  return (
    <LayoutAutenticacao
      idPagina="pagina-cadastro"
      variantePainel="cadastro"
      tituloCard="Criar conta"
      titulo="Crie sua conta"
      subtitulo="leva menos de um minuto."
      linkTopo={{ id: "link-topo-entrar", href: ROTAS.login, texto: "entrar" }}
    >
      {/* Conta nova: leva direto para completar o perfil */}
      <FormularioCadastro aoCadastrar={() => navigate("/perfil/editar", { replace: true })} />
    </LayoutAutenticacao>
  );
}

export default function Cadastro() {
  const { carregando } = useAuth();
  // Espera confirmar a sessão salva antes de decidir se mostra o formulário
  return carregando ? null : <CadastroConteudo />;
}
