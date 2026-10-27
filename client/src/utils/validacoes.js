// Regras de validação dos formulários de login e cadastro.
// Os limites seguem o banco de dados (tabela usuarios).

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Letras minúsculas, números, ponto e underline (ex.: ana_banana)
const PADRAO_NOME_USUARIO = /^[a-z0-9._]+$/;

export const TAMANHO_MINIMO_SENHA = 6;
export const TAMANHO_MINIMO_NOME_USUARIO = 3;
export const TAMANHO_MAXIMO_NOME_USUARIO = 30; // VARCHAR(30) no banco

export function validarEmail(email) {
  if (!email.trim()) return "Digite seu e-mail.";
  if (!PADRAO_EMAIL.test(email)) return "Digite um e-mail válido, como nome@email.com.";
  return "";
}

export function validarSenha(senha) {
  if (!senha) return "Digite sua senha.";
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }
  return "";
}

export function validarNomeUsuario(nomeUsuario) {
  if (!nomeUsuario) return "Escolha um nome de usuário.";
  if (nomeUsuario.length < TAMANHO_MINIMO_NOME_USUARIO) {
    return `O nome de usuário precisa ter pelo menos ${TAMANHO_MINIMO_NOME_USUARIO} caracteres.`;
  }
  if (nomeUsuario.length > TAMANHO_MAXIMO_NOME_USUARIO) {
    return `O nome de usuário pode ter no máximo ${TAMANHO_MAXIMO_NOME_USUARIO} caracteres.`;
  }
  if (!PADRAO_NOME_USUARIO.test(nomeUsuario)) {
    return "Use só letras minúsculas, números, ponto ou underline.";
  }
  return "";
}

export function validarConfirmacaoSenha(senha, confirmacao) {
  if (!confirmacao) return "Repita a senha.";
  if (senha !== confirmacao) return "As senhas não são iguais.";
  return "";
}

// Junta os erros num objeto só com os campos que têm problema, ex.: { email: "..." }
function juntarErros(lista) {
  return Object.fromEntries(lista.filter(([, mensagem]) => mensagem));
}

export function validarLogin({ email, senha }) {
  return juntarErros([
    ["email", validarEmail(email)],
    ["senha", validarSenha(senha)],
  ]);
}

export function validarCadastro({ nomeUsuario, email, senha, confirmacaoSenha, aceitouTermos }) {
  return juntarErros([
    ["nomeUsuario", validarNomeUsuario(nomeUsuario)],
    ["email", validarEmail(email)],
    ["senha", validarSenha(senha)],
    ["confirmacaoSenha", validarConfirmacaoSenha(senha, confirmacaoSenha)],
    ["aceitouTermos", aceitouTermos ? "" : "Você precisa aceitar os termos para criar a conta."],
  ]);
}
