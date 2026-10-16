import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("carregando...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("erro ao conectar"));
  }, []);

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Meu Projeto</h1>
        <p className="mt-2 text-slate-300">API: {status}</p>
      </div>
    </main>
  );
}