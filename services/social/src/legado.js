import { ErroHttp } from "./util.js";

// Cliente HTTP do monólito (server), que ainda é dono dos usuários.
const URL_LEGADO = () => process.env.LEGADO_URL || "http://localhost:3001";
const TOKEN_INTERNO = () => process.env.INTERNAL_TOKEN || "token-interno-dev";

async function pedir(caminho, { interno = false, timeoutMs = 3000 } = {}) {
  const resposta = await fetch(`${URL_LEGADO()}${caminho}`, {
    headers: {
      Accept: "application/json",
      ...(interno ? { "x-token-interno": TOKEN_INTERNO() } : {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();
}

// Dados públicos (id, nome, usuario, foto) de vários usuários de uma vez.
// Quem não existe simplesmente não aparece no resultado.
export async function buscarUsuarios(ids) {
  if (ids.length === 0) return [];
  try {
    return await pedir(`/api/usuarios?ids=${ids.join(",")}&limite=200`);
  } catch (erro) {
    console.error(`[social] monólito indisponível (usuários): ${erro.message}`);
    throw new ErroHttp(503, "Serviço de usuários indisponível. Tente de novo em instantes.");
  }
}

// Todos os pares { seguidor_id, seguido_id } que existiam antes da separação
export const exportarSeguidores = () => pedir("/api/interno/seguidores", { interno: true, timeoutMs: 8000 });
