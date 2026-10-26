// Serviço de autenticação (login e cadastro).
// HOJE: simula as respostas (as telas ainda são estáticas, sem back-end).
// DEPOIS: troque o corpo das funções pela chamada real ao serviço de usuários,
// mantendo a mesma assinatura. As telas não precisam mudar.

const URL_API_USUARIOS = import.meta.env.VITE_API_USUARIOS_URL ?? "http://localhost:3001";

// Espera um pouco para imitar o tempo de resposta de um servidor
const simularEspera = () => new Promise((resolver) => setTimeout(resolver, 600));

// Faz o POST e transforma resposta de erro em Error com a mensagem do servidor
async function enviarParaApi(caminho, dados, mensagemPadrao) {
  const resposta = await fetch(`${URL_API_USUARIOS}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo.mensagem ?? mensagemPadrao);
  }
  return resposta.json();
}

export async function entrar({ email, senha, lembrarDeMim }) {
  // --- Simulação (remover quando o back-end existir) ---
  await simularEspera();
  return { usuario: { email }, token: "token-de-exemplo", lembrarDeMim };

  // --- Versão real ---
  // return enviarParaApi("/auth/login", { email, senha }, "E-mail ou senha incorretos.");
}

export async function cadastrar({ nomeUsuario, email, senha }) {
  // --- Simulação (remover quando o back-end existir) ---
  await simularEspera();
  return { usuario: { nomeUsuario, email }, token: "token-de-exemplo" };

  // --- Versão real ---
  // O back-end deve responder 409 com { mensagem } se o e-mail ou o usuário já existir.
  // return enviarParaApi(
  //   "/auth/cadastro",
  //   { nome_usuario: nomeUsuario, email, senha },
  //   "Não foi possível criar a conta agora."
  // );
}

export { URL_API_USUARIOS, enviarParaApi };
