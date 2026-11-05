// Cliente do microsserviço de seguidores (services/social).
// Se ele estiver fora do ar, o monólito continua funcionando: o perfil abre com contadores zerados.
const url = () => process.env.SOCIAL_URL || "http://localhost:4002";
const token = () => process.env.INTERNAL_TOKEN || "token-interno-dev";

async function chamar(caminho, opcoes = {}) {
  const resposta = await fetch(`${url()}${caminho}`, {
    ...opcoes,
    headers: { "x-token-interno": token() },
    signal: AbortSignal.timeout(2000),
  });
  if (!resposta.ok && resposta.status !== 204) throw new Error(`HTTP ${resposta.status}`);
  return resposta.status === 204 ? null : resposta.json();
}

export async function contagens(usuarioId, visitanteId) {
  try {
    const viewer = visitanteId ? `?viewer=${visitanteId}` : "";
    return await chamar(`/interno/contagem/${usuarioId}${viewer}`);
  } catch (erro) {
    console.warn(`[social] indisponível, usando contadores zerados: ${erro.message}`);
    return { seguidores: 0, seguindo: 0, euSigo: false };
  }
}

// Conta apagada: pede para o serviço social limpar as relações dela (sem travar a resposta)
export function removerUsuario(usuarioId) {
  chamar(`/interno/usuarios/${usuarioId}`, { method: "DELETE" }).catch((erro) =>
    console.warn(`[social] não consegui limpar seguidores do usuário ${usuarioId}: ${erro.message}`)
  );
}
