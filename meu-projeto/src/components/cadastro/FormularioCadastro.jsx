import { useState } from "react";
import CampoTexto from "../ui/CampoTexto.jsx";
import BotaoMostrarSenha from "../auth/BotaoMostrarSenha.jsx";
import {
  validarCadastro,
  TAMANHO_MINIMO_SENHA,
  TAMANHO_MAXIMO_NOME_USUARIO,
} from "../../utils/validacoes.js";
import { cadastrar } from "../../services/authService.js";
import { ROTAS } from "../../rotas.js";

const VALORES_INICIAIS = {
  nomeUsuario: "",
  email: "",
  senha: "",
  confirmacaoSenha: "",
  aceitouTermos: false,
};

// Formulário de cadastro de conta.
// Campos alinhados com a tabela `usuarios`: nome_usuario, email e senha
// (a senha vira senha_hash no back-end).
// `aoCadastrar` (opcional) recebe a resposta, para a página decidir o próximo passo.
export default function FormularioCadastro({ aoCadastrar }) {
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function atualizarCampo(evento) {
    const { name: campo, type, value, checked } = evento.target;
    let novoValor = type === "checkbox" ? checked : value;
    // Nome de usuário sempre em minúsculas e sem espaços
    if (campo === "nomeUsuario") novoValor = novoValor.toLowerCase().replace(/\s/g, "");

    setValores((atuais) => ({ ...atuais, [campo]: novoValor }));
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: "" }));
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setErroGeral("");

    const novosErros = validarCadastro(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      const { nomeUsuario, email, senha } = valores;
      const resposta = await cadastrar({ nomeUsuario, email, senha });
      aoCadastrar?.(resposta);
    } catch (erro) {
      setErroGeral(erro.message || "Não foi possível criar a conta agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const tipoSenha = mostrarSenha ? "text" : "password";
  const alternarSenha = () => setMostrarSenha((atual) => !atual);

  return (
    <form id="formulario-cadastro" noValidate onSubmit={enviarFormulario} className="flex flex-col gap-5">
      {erroGeral && (
        <p
          id="cadastro-erro-geral"
          role="alert"
          className="rounded-md border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {erroGeral}
        </p>
      )}

      <CampoTexto
        id="cadastro-nome-usuario"
        nome="nomeUsuario"
        rotulo="Nome de usuário"
        prefixo="@"
        valor={valores.nomeUsuario}
        aoMudar={atualizarCampo}
        erro={erros.nomeUsuario}
        dica="Aparece no seu perfil. Letras minúsculas, números, ponto ou underline."
        placeholder="ana_banana"
        autoComplete="username"
        maxLength={TAMANHO_MAXIMO_NOME_USUARIO}
      />

      <CampoTexto
        id="cadastro-email"
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
        id="cadastro-senha"
        nome="senha"
        rotulo="Senha"
        tipo={tipoSenha}
        valor={valores.senha}
        aoMudar={atualizarCampo}
        erro={erros.senha}
        dica={`Pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`}
        placeholder="crie uma senha"
        autoComplete="new-password"
        elementoDireita={
          <BotaoMostrarSenha
            id="botao-mostrar-senha-cadastro"
            idCampo="cadastro-senha"
            mostrando={mostrarSenha}
            aoAlternar={alternarSenha}
          />
        }
      />

      <CampoTexto
        id="cadastro-confirmar-senha"
        nome="confirmacaoSenha"
        rotulo="Confirmar senha"
        tipo={tipoSenha}
        valor={valores.confirmacaoSenha}
        aoMudar={atualizarCampo}
        erro={erros.confirmacaoSenha}
        placeholder="repita a senha"
        autoComplete="new-password"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cadastro-termos" className="inline-flex cursor-pointer items-start gap-2 text-sm">
          <input
            id="cadastro-termos"
            name="aceitouTermos"
            type="checkbox"
            checked={valores.aceitouTermos}
            onChange={atualizarCampo}
            aria-invalid={erros.aceitouTermos ? "true" : "false"}
            aria-describedby={erros.aceitouTermos ? "cadastro-termos-erro" : undefined}
            className="mt-0.5 size-4 shrink-0 accent-neutral-900"
          />
          <span>
            Li e aceito os{" "}
            <a
              id="link-termos-de-uso"
              href={ROTAS.termos}
              className="font-bold underline underline-offset-4 hover:decoration-destaque hover:decoration-2"
            >
              termos de uso
            </a>
          </span>
        </label>
        {erros.aceitouTermos && (
          <p id="cadastro-termos-erro" role="alert" className="text-xs text-red-600">
            {erros.aceitouTermos}
          </p>
        )}
      </div>

      <button
        id="botao-criar-conta"
        type="submit"
        disabled={enviando}
        className="botao-retro w-full bg-neutral-900 py-3 text-white shadow-[0_4px_0_0_var(--color-jogo)]"
      >
        {enviando ? "criando conta..." : "criar conta →"}
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-400" aria-hidden="true">
        <span className="h-px flex-1 bg-neutral-300" />
        ou
        <span className="h-px flex-1 bg-neutral-300" />
      </div>

      <p className="text-center text-sm">
        Já tem conta?{" "}
        <a id="link-ir-para-login" href={ROTAS.login} className="botao-retro ml-1 bg-destaque px-4 py-1.5 text-xs">
          entrar
        </a>
      </p>
    </form>
  );
}
