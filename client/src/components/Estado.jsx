// Mensagens padrão de carregamento e erro para as telas que dependem da API.
export function Carregando({ texto = "carregando..." }) {
  return <p className="py-6 font-mono text-sm text-neutral-500">{texto}</p>;
}

export function MensagemErro({ erro, onTentarDeNovo }) {
  return (
    <div role="alert" className="py-6 font-mono text-sm text-red-700">
      <p>{erro}</p>
      {onTentarDeNovo && (
        <button type="button" onClick={onTentarDeNovo} className="mt-2 underline">
          tentar de novo
        </button>
      )}
    </div>
  );
}
