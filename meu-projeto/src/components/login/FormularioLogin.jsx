import { useState } from "react";
import CampoTexto from "../ui/CampoTexto.jsx";
import { validarLogin } from "../../utils/validacoes.js";
import { entrar } from "../../services/authService.js";
import BotaoMostrarSenha from "../auth/BotaoMostrarSenha.jsx";
import { ROTAS } from "../../rotas.js";

const VALORES_INICIAIS = { email: "", senha: "", lembrarDeMim: false };

// Formulário de login.
// - Estado controlado: os valores já ficam prontos para enviar ao back-end.
// - `aoEntrar` (opcional) recebe a resposta do login, para a página decidir
//   o que fazer depois (salvar token, redirecionar para a home...).
export default function FormularioLogin({ aoEntrar }) {
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function atualizarCampo(evento) {
    const { name: campo, type, value, checked } = evento.target;
    setValores((atuais) => ({ ...atuais, [campo]: type === "checkbox" ? checked : value }));
    // Limpa o erro do campo assim que a pessoa volta a digitar
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: "" }));
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setErroGeral("");

    const novosErros = validarLogin(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      const resposta = await entrar(valores);
      aoEntrar?.(resposta);
    } catch (erro) {
      setErroGeral(erro.message || "Não foi possível entrar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form id="formulario-login" noValidate onSubmit={enviarFormulario} className="flex flex-col gap-5">
      {erroGeral && (
        <p
          id="login-erro-geral"
          role="alert"
          className="rounded-md border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {erroGeral}
        </p>
      )}

      <CampoTexto
        id="login-email"
        nome="email"
        rotulo="E-mail"
        tipo="email"
        valor={valores.email}
        aoMudar={atualizarCampo}
        erro={erros.email}
        placeholder="nome@email.com"
        autoComplete="email"
      />

      <CampoTexto
        id="login-senha"
        nome="senha"
        rotulo="Senha"
        tipo={mostrarSenha ? "text" : "password"}
        valor={valores.senha}
        aoMudar={atualizarCampo}
        erro={erros.senha}
        placeholder="sua senha"
        autoComplete="current-password"
        elementoDireita={
          <BotaoMostrarSenha
            id="botao-mostrar-senha"
            idCampo="login-senha"
            mostrando={mostrarSenha}
            aoAlternar={() => setMostrarSenha((atual) => !atual)}
          />
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label htmlFor="login-lembrar" className="inline-flex cursor-pointer items-center gap-2">
          <input
            id="login-lembrar"
            name="lembrarDeMim"
            type="checkbox"
            checked={valores.lembrarDeMim}
            onChange={atualizarCampo}
            className="size-4 accent-neutral-900"
          />
          lembrar de mim
        </label>

        <a
          id="link-esqueci-senha"
          href={ROTAS.esqueciSenha}
          className="font-bold underline underline-offset-4 hover:decoration-destaque hover:decoration-2"
        >
          esqueci a senha
        </a>
      </div>

      <button
        id="botao-entrar"
        type="submit"
        disabled={enviando}
        className="botao-retro w-full bg-neutral-900 py-3 text-white shadow-[0_4px_0_0_var(--color-livro)]"
      >
        {enviando ? "entrando..." : "entrar →"}
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-400" aria-hidden="true">
        <span className="h-px flex-1 bg-neutral-300" />
        ou
        <span className="h-px flex-1 bg-neutral-300" />
      </div>

      <p className="text-center text-sm">
        Ainda não tem conta?{" "}
        <a
          id="link-criar-conta"
          href={ROTAS.cadastro}
          className="botao-retro ml-1 bg-destaque px-4 py-1.5 text-xs"
        >
          criar conta
        </a>
      </p>
    </form>
  );
}
