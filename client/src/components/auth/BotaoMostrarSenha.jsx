// Botão "mostrar / ocultar" usado dentro dos campos de senha.
// `idCampo` é o id do input de senha que ele controla.
export default function BotaoMostrarSenha({ id, idCampo, mostrando, aoAlternar }) {
  return (
    <button
      id={id}
      type="button"
      onClick={aoAlternar}
      aria-pressed={mostrando}
      aria-controls={idCampo}
      className="rounded px-2 py-1 text-xs font-bold underline underline-offset-2 hover:bg-neutral-100"
    >
      {mostrando ? "ocultar" : "mostrar"}
    </button>
  );
}
