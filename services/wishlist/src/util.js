// Erro com status HTTP: o handler global devolve { mensagem } ao front
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function idParam(valor, nome = "Id") {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErroHttp(400, `${nome} inválido.`);
  return n;
}
