import { Link } from "react-router-dom";
import Card from "../components/Card";

// Páginas de texto curto (termos de uso, recuperar senha...)
export default function PaginaSimples({ titulo, children }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card titulo={titulo}>
        <div className="space-y-3 text-left text-sm leading-relaxed">{children}</div>
        <Link to="/" className="mt-6 inline-block font-mono text-sm underline">
          voltar ao início
        </Link>
      </Card>
    </div>
  );
}
