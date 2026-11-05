import { db, transacao } from "./db.js";
import { exportarFavoritos } from "./legado.js";

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

const jaImportou = () =>
  Boolean(db.prepare("SELECT 1 FROM meta WHERE chave = 'importado_do_legado'").get());

// Copia UMA vez os favoritos que estavam no banco do monólito.
// O marcador em `meta` evita ressuscitar dados antigos se a pessoa remover tudo depois.
export async function importarDoLegado({ tentativas = 30, esperaMs = 2000 } = {}) {
  if (jaImportou()) return { importados: 0, jaFeito: true };

  for (let i = 1; i <= tentativas; i++) {
    try {
      const linhas = await exportarFavoritos();
      const inserir = db.prepare(
        "INSERT OR IGNORE INTO favoritos (usuario_id, obra_id, criado_em) VALUES (?, ?, COALESCE(?, datetime('now')))"
      );
      let importados = 0;
      transacao(() => {
        for (const l of linhas) {
          const usuario = Number(l.usuario_id);
          const obra = Number(l.obra_id);
          if (!Number.isInteger(usuario) || usuario <= 0 || !Number.isInteger(obra) || obra <= 0) continue;
          const criadoEm = typeof l.criado_em === "string" ? l.criado_em : null; // mantém a ordem original
          importados += Number(inserir.run(usuario, obra, criadoEm).changes);
        }
        db.prepare("INSERT OR REPLACE INTO meta (chave, valor) VALUES ('importado_do_legado', datetime('now'))").run();
      });
      console.log(`[favoritos] ${importados} favoritos importados do monólito.`);
      return { importados, jaFeito: false };
    } catch (erro) {
      console.warn(`[favoritos] importação adiada (${i}/${tentativas}): ${erro.message}`);
      await espera(esperaMs);
    }
  }
  console.error("[favoritos] não consegui importar do monólito; tento de novo na próxima inicialização.");
  return { importados: 0, jaFeito: false, falhou: true };
}
