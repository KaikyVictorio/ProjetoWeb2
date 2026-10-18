export default function Card({ titulo, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden border border-slate-700 outline outline-1 outline-offset-3 outline-slate-700 font-mono ${className}`}
    >
      {titulo && (
        <h3 className="border-b border-slate-700 bg-gray-200 py-1 font-semibold text-left pl-5 text-lg uppercase">
          {titulo}
        </h3>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}