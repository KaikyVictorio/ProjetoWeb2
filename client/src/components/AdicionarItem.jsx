export default function AdicionarItem({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Adicionar item"
      className="grid aspect-[2/3] w-full place-items-center border-2 border-dashed border-neutral-400 text-4xl font-bold text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-700"
    >
      +
    </button>
  );
}