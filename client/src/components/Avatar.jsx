const AVATAR_PADRAO = "/avatar-padrao.png";

export default function Avatar({ src, nome, className = "" }) {
  return (
    <img
      src={src || AVATAR_PADRAO}
      alt={nome ? `Foto de ${nome}` : ""}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = AVATAR_PADRAO;
      }}
      className={`rounded-full object-cover ${className}`}
    />
  );
}