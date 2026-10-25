export default function Avaliacao({ valor, onChange, tamanho = 35 }) {
  const editavel = typeof onChange === "function";

  return (
    <div className="flex" style={{ width: tamanho * 5 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="relative block text-neutral-300"
          style={{ fontSize: tamanho, lineHeight: 1, width: tamanho, height: tamanho }}
        >
          ★
          <span
            className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-yellow-500"
            style={{ width: valor >= n ? "100%" : valor === n - 0.5 ? "50%" : "0%" }}
          >
            ★
          </span>

          {editavel && (
            <>
              <button
                type="button"
                aria-label={`${n - 0.5} estrelas`}
                onClick={() => onChange(valor === n - 0.5 ? 0 : n - 0.5)}
                className="absolute inset-y-0 left-0 w-1/2"
              />
              <button
                type="button"
                aria-label={`${n} estrelas`}
                onClick={() => onChange(valor === n ? 0 : n)}
                className="absolute inset-y-0 right-0 w-1/2"
              />
            </>
          )}
        </span>
      ))}
    </div>
  );
}