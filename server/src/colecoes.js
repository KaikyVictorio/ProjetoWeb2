// Clientes dos microsserviços de favoritos (services/favoritos) e wishlist (services/wishlist).
// Se um deles estiver fora do ar, o monólito continua funcionando: a página da obra abre sem
// as marcas de favorito/wishlist e o resumo do perfil abre com a fila vazia.
const token = () => process.env.INTERNAL_TOKEN || "token-interno-dev";

function cliente(nome, variavelUrl, portaPadrao) {
  const url = () => process.env[variavelUrl] || `http://localhost:${portaPadrao}`;

  async function chamar(caminho, opcoes = {}) {
    const resposta = await fetch(`${url()}${caminho}`, {
      ...opcoes,
      headers: { "x-token-interno": token() },
      signal: AbortSignal.timeout(2000),
    });
    if (!resposta.ok && resposta.status !== 204) throw new Error(`HTTP ${resposta.status}`);
    return resposta.status === 204 ? null : resposta.json();
  }

  // Apaga em segundo plano (sem travar a resposta) e só avisa no log se falhar
  const avisar = (caminho, o_que) =>
    chamar(caminho, { method: "DELETE" }).catch((erro) =>
      console.warn(`[${nome}] não consegui limpar ${o_que}: ${erro.message}`)
    );

  return {
    nome,
    chamar,

    // A pessoa marcou esta obra? (indisponível = false)
    async tem(usuarioId, obraId) {
      try {
        return (await chamar(`/interno/tem/${usuarioId}/${obraId}`)).tem;
      } catch (erro) {
        console.warn(`[${nome}] indisponível, assumindo que não: ${erro.message}`);
        return false;
      }
    },

    // Conta apagada: o serviço remove tudo que era dela
    removerUsuario: (usuarioId) => avisar(`/interno/usuarios/${usuarioId}`, `os dados do usuário ${usuarioId}`),

    // Obra apagada: o serviço remove as marcas dela
    removerObra: (obraId) => avisar(`/interno/obras/${obraId}`, `as marcas da obra ${obraId}`),
  };
}

export const favoritos = cliente("favoritos", "FAVORITOS_URL", 4003);
export const wishlist = cliente("wishlist", "WISHLIST_URL", 4004);

// Ids das últimas obras da wishlist, mais recentes primeiro (indisponível = lista vazia)
export async function wishlistRecentes(usuarioId, limite = 3) {
  try {
    return (await wishlist.chamar(`/interno/recentes/${usuarioId}?limite=${limite}`)).obraIds;
  } catch (erro) {
    console.warn(`[wishlist] indisponível, usando fila vazia: ${erro.message}`);
    return [];
  }
}
