
import { useEffect, useState } from "react";
import { api, consulta } from "../api";

export function useBuscaObras(termo, { categoria, limite = 8 } = {}) {
  const [estado, setEstado] = useState({
    resultados: [],
    buscando: true,
    erro: "",
  });

  useEffect(() => {
    let cancelado = false;

    const espera = setTimeout(async () => {
      const q = termo.trim();

      try {
        const consultas = [
          api.get(
            `/obras${consulta({
              q,
              categoria,
              limite,
              origem: "externa",
            })}`
          ),
        ];

        // O catálogo externo precisa de pelo menos 2 caracteres.
        if (q.length >= 2) {
          consultas.push(
            api.get(
              `/catalogo/obras${consulta({
                q,
                categoria,
                limite,
              })}`
            )
          );
        }

        const resultados = await Promise.allSettled(consultas);

        const local =
          resultados[0].status === "fulfilled"
            ? resultados[0].value
            : [];

        const externas =
          resultados[1]?.status === "fulfilled"
            ? resultados[1].value
            : [];

        if (
          resultados[0].status === "rejected" &&
          (!resultados[1] || resultados[1].status === "rejected")
        ) {
          throw resultados[0].reason;
        }

        // Identifica as obras externas que já foram importadas.
        const idsImportados = new Set(
          local
            .filter((obra) => obra.fonte && obra.id_externo)
            .map((obra) => `${obra.fonte}:${obra.id_externo}`)
        );

        // Não mostra novamente uma obra que já existe no SQLite.
        const novasExternas = externas.filter(
          (obra) => !idsImportados.has(String(obra.id))
        );

        const combinadas = [
          ...local.map((obra) => ({ ...obra, origem: "local" })),
          ...novasExternas.map((obra) => ({ ...obra, origem: "externa" })),
        ];

        if (!cancelado) {
          setEstado({
            resultados: combinadas.slice(0, limite),
            buscando: false,
            erro: "",
          });
        }
      } catch (e) {
        if (!cancelado) {
          setEstado({
            resultados: [],
            buscando: false,
            erro: e.message,
          });
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, categoria, limite]);

  return estado;
}
