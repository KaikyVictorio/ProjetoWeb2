import LayoutAutenticacao from "../components/auth/LayoutAutenticacao.jsx";
import FormularioLogin from "../components/login/FormularioLogin.jsx";
import { ROTAS } from "../rotas.js";

// Página de login.
// Por enquanto só mostra a resposta simulada no console.
// Quando houver back-end/rotas: salve o token e redirecione para a home aqui.
export default function Login() {
  function aoEntrar(resposta) {
    console.log("Login simulado:", resposta);
    // ex. futuro: salvarSessao(resposta.token); navigate(ROTAS.home);
  }

  return (
    <LayoutAutenticacao
      idPagina="pagina-login"
      variantePainel="login"
      tituloCard="Entrar"
      titulo="Bem-vindo de volta"
      subtitulo="o que vamos registrar hoje?"
      linkTopo={{ id: "link-topo-criar-conta", href: ROTAS.cadastro, texto: "criar conta" }}
    >
      <FormularioLogin aoEntrar={aoEntrar} />
    </LayoutAutenticacao>
  );
}
