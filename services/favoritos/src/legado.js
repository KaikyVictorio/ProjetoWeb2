import { ErroHttp } from "./util.js";

// Cliente HTTP do monólito (server), que ainda é dono de usuários e obras.
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
    return await pedir(`/api/usuarios?ids=${ids.join(",")}`);
  } catch (erro) {
    console.error(`[favoritos] monólito indisponível (usuários): ${erro.message}`);
    throw new ErroHttp(503, "Serviço de usuários indisponível. Tente de novo em instantes.");
  }
}

// Dados das obras (id, titulo, ano, categoria, imagem...) de várias de uma vez.
// Obra que não existe mais simplesmente não aparece no resultado.
export async function buscarObras(ids) {
  if (ids.length === 0) return [];
  try {
    const achadas = [];
    for (let i = 0; i < ids.length; i += 100) {
      achadas.push(...(await pedir(`/api/obras?ids=${ids.slice(i, i + 100).join(",")}`)));
    }
    return achadas;
  } catch (erro) {
    console.error(`[favoritos] monólito indisponível (obras): ${erro.message}`);
    throw new ErroHttp(503, "Serviço de obras indisponível. Tente de novo em instantes.");
  }
}

// Todos os { usuario_id, obra_id, criado_em } que existiam antes da separação
export const exportarFavoritos = () => pedir("/api/interno/favoritos", { interno: true, timeoutMs: 8000 });
