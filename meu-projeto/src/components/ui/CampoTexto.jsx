// Campo de formulário com rótulo, dica, mensagem de erro e espaços opcionais
// à esquerda (prefixo, ex.: "@") e à direita (ex.: botão de mostrar senha).
// `nome` é a chave do campo no estado do formulário (ex.: "email").
export default function CampoTexto({
  id,
  nome,
  rotulo,
  tipo = "text",
  valor,
  aoMudar,
  erro,
  dica,
  prefixo,
  elementoDireita,
  ...propsInput
}) {
  const idErro = `${id}-erro`;
  const idDica = `${id}-dica`;
  // O leitor de tela lê o erro quando existe; senão, lê a dica
  const descricao = erro ? idErro : dica ? idDica : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest">
        {rotulo}
      </label>

      <div className="relative">
        {prefixo && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-neutral-500"
          >
            {prefixo}
          </span>
        )}
        <input
          id={id}
          name={nome ?? id}
          type={tipo}
          value={valor}
          onChange={aoMudar}
          aria-invalid={erro ? "true" : "false"}
          aria-describedby={descricao}
          className={`campo-retro ${prefixo ? "pl-8" : ""} ${elementoDireita ? "pr-20" : ""}`}
          {...propsInput}
        />
        {elementoDireita && (
          <div className="absolute inset-y-0 right-2 flex items-center">{elementoDireita}</div>
        )}
      </div>

      {erro ? (
        <p id={idErro} role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      ) : (
        dica && (
          <p id={idDica} className="text-xs text-neutral-500">
            {dica}
          </p>
        )
      )}
    </div>
  );
}
