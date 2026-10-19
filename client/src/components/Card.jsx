export default function Card({ titulo, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-slate-400 font-mono bg-white ${className}`}
    >
      {titulo && (
        <h3 className="border-b border-slate-300 bg-slate- py-3 font-semibold text-left pl-5 text-[18px] uppercase text-[#242424] bg-[radial-gradient(ellipse_at_center,#f0f0f0_35%,#fff_100%)]!">
          {titulo}
        </h3>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}