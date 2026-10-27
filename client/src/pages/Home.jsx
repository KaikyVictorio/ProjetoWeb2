import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("carregando...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("erro ao conectar"));
  }, []);

  return (
    <section>
      <h1>Bem-vindo!</h1>
    </section>
  );
}