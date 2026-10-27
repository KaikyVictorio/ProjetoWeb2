import { useEffect, useState } from "react";
import { api, consulta } from "../api";

// Busca obras na API enquanto a pessoa digita (com um pequeno atraso para não
// disparar uma requisição por tecla). Sem termo, devolve as primeiras do catálogo.
export function useBuscaObras(termo, { categoria, limite = 8 } = {}) {
  const [estado, setEstado] = useState({ resultados: [], buscando: true, erro: "" });

  useEffect(() => {
    let cancelado = false;
    const espera = setTimeout(() => {
      api
        .get(`/obras${consulta({ q: termo.trim(), categoria, limite })}`)
        .then((resultados) => !cancelado && setEstado({ resultados, buscando: false, erro: "" }))
        .catch((e) => !cancelado && setEstado({ resultados: [], buscando: false, erro: e.message }));
    }, 250);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, categoria, limite]);

  return estado;
}
