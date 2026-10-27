import { Link } from "react-router-dom";

// Logo do projeto (usado nas telas de autenticação).
export default function Logo() {
  return (
    <Link id="logo-projeto" to="/" aria-label="Página inicial" className="inline-block">
      <img src="/estante virtual.png" alt="Estante Virtual" className="h-12 w-auto" />
    </Link>
  );
}
