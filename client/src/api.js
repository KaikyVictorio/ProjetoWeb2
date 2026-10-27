// Cliente HTTP do front: todas as telas falam com o back-end por aqui.
// Em desenvolvimento o Vite redireciona /api para o servidor (veja vite.config.js).

const BASE = import.meta.env.VITE_API_URL ?? "/api";
const CHAVE_TOKEN = "estante:token";

export const sessao = {
  token: () => localStorage.getItem(CHAVE_TOKEN) || sessionStorage.getItem(CHAVE_TOKEN),
  // lembrar = true guarda no navegador; false vale só até fechar a aba
  salvar(token, lembrar = true) {
    this.limpar();
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE_TOKEN, token);
  },
  limpar() {
    localStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_TOKEN);
  },
};

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

async function pedir(metodo, caminho, corpo) {
  const token = sessao.token();
  let resposta;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi("Não foi possível conectar ao servidor. Tente de novo.", 0);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // Token vencido ou inválido: avisa o AuthContext para encerrar a sessão
    if (resposta.status === 401 && token) window.dispatchEvent(new Event("estante:sessao-expirada"));
    throw new ErroApi(dados?.mensagem ?? "Algo deu errado. Tente de novo.", resposta.status);
  }
  return dados;
}

export const api = {
  get: (caminho) => pedir("GET", caminho),
  post: (caminho, corpo = {}) => pedir("POST", caminho, corpo),
  put: (caminho, corpo = {}) => pedir("PUT", caminho, corpo),
  delete: (caminho) => pedir("DELETE", caminho),
};

// Monta ?a=1&b=2 ignorando valores vazios
export function consulta(params) {
  const q = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== "") q.set(chave, valor);
  }
  const texto = q.toString();
  return texto ? `?${texto}` : "";
}
