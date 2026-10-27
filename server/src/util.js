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

// Texto aparado e limitado; qualquer coisa que não seja string vira ""
export function texto(valor, max = 500) {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

export function nota(valor) {
  const n = Number(valor ?? 0);
  if (!Number.isFinite(n) || n < 0 || n > 5 || (n * 2) % 1 !== 0) {
    throw new ErroHttp(400, "A nota deve ir de 0 a 5, em passos de 0,5.");
  }
  return n;
}

export const hoje = () => new Date().toISOString().slice(0, 10);

export function dataValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return hoje();
  return Number.isNaN(Date.parse(valor)) ? hoje() : valor;
}

export function paginacao(query, padrao = 50, maximo = 200) {
  const limite = Math.min(Math.max(Number(query.limite) || padrao, 1), maximo);
  const offset = Math.max(Number(query.offset) || 0, 0);
  return { limite, offset };
}

// Escapa % e _ para usar o termo num LIKE
export function like(termo) {
  return `%${String(termo).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
