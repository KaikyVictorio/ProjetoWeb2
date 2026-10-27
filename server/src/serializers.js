import { db } from "./db.js";

const json = (texto, padrao) => {
  try {
    return JSON.parse(texto);
  } catch {
    return padrao;
  }
};

export const obraJson = (o) => ({
  id: o.id,
  titulo: o.titulo,
  ano: o.ano,
  categoria: o.categoria,
  imagem: o.imagem || null,
  autor: o.autor || "",
  generos: json(o.generos, []),
  sinopse: o.sinopse || "",
  criadoPor: o.criado_por ?? null,
});

// Versão enxuta para listas e capas
export const obraResumo = (o) => ({
  id: o.id,
  titulo: o.titulo,
  ano: o.ano,
  categoria: o.categoria,
  imagem: o.imagem || null,
});

export const usuarioBasico = (u) => ({
  id: u.id,
  nome: u.nome,
  usuario: u.usuario,
  foto: u.foto || "",
});

export const usuarioCompleto = (u) => ({
  ...usuarioBasico(u),
  email: u.email,
  bio: u.bio || "",
  infos: json(u.infos, []),
});

export const SELECT_LOG = `
  SELECT l.*, u.usuario AS u_usuario, u.foto AS u_foto,
         o.titulo AS o_titulo, o.ano AS o_ano, o.categoria AS o_categoria, o.imagem AS o_imagem
  FROM logs l
  JOIN usuarios u ON u.id = l.usuario_id
  JOIN obras o ON o.id = l.obra_id
`;

export const logJson = (r) => ({
  id: r.id,
  tipo: r.texto ? "review" : "terminou",
  data: r.data,
  usuario: r.u_usuario,
  usuarioId: r.usuario_id,
  foto: r.u_foto || "",
  obra: {
    id: r.obra_id,
    titulo: r.o_titulo,
    ano: r.o_ano,
    categoria: r.o_categoria,
    imagem: r.o_imagem || null,
  },
  nota: r.nota,
  texto: r.texto,
  spoiler: Boolean(r.spoiler),
  jaFeito: Boolean(r.ja_feito),
});

export function buscarLog(id) {
  const linha = db.prepare(`${SELECT_LOG} WHERE l.id = ?`).get(id);
  return linha ? logJson(linha) : null;
}
