import LayoutAutenticacao from "../components/auth/LayoutAutenticacao.jsx";
import FormularioCadastro from "../components/cadastro/FormularioCadastro.jsx";
import { ROTAS } from "../rotas.js";

// Página de cadastro de conta.
// Por enquanto só mostra a resposta simulada no console.
// Quando houver back-end/rotas: salve o token e leve a pessoa para a home ou para editar o perfil.
export default function Cadastro() {
  function aoCadastrar(resposta) {
    console.log("Cadastro simulado:", resposta);
    // ex. futuro: salvarSessao(resposta.token); navigate(ROTAS.home);
  }

  return (
    <LayoutAutenticacao
      idPagina="pagina-cadastro"
      variantePainel="cadastro"
      tituloCard="Criar conta"
      titulo="Crie sua conta"
      subtitulo="leva menos de um minuto."
      linkTopo={{ id: "link-topo-entrar", href: ROTAS.login, texto: "entrar" }}
    >
      <FormularioCadastro aoCadastrar={aoCadastrar} />
    </LayoutAutenticacao>
  );
}
