import { db, transacao } from "./db.js";
import { exportarSeguidores } from "./legado.js";

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

const jaImportou = () =>
  Boolean(db.prepare("SELECT 1 FROM meta WHERE chave = 'importado_do_legado'").get());

// Copia UMA vez os seguidores que estavam no banco do monólito.
// O marcador em `meta` evita ressuscitar dados antigos se todo mundo deixar de seguir depois.
export async function importarDoLegado({ tentativas = 30, esperaMs = 2000 } = {}) {
  if (jaImportou()) return { importados: 0, jaFeito: true };

  for (let i = 1; i <= tentativas; i++) {
    try {
      const pares = await exportarSeguidores();
      const inserir = db.prepare("INSERT OR IGNORE INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)");
      let importados = 0;
      transacao(() => {
        for (const p of pares) {
          const a = Number(p.seguidor_id);
          const b = Number(p.seguido_id);
          if (!Number.isInteger(a) || !Number.isInteger(b) || a === b) continue;
          importados += Number(inserir.run(a, b).changes);
        }
        db.prepare("INSERT OR REPLACE INTO meta (chave, valor) VALUES ('importado_do_legado', datetime('now'))").run();
      });
      console.log(`[social] ${importados} relações importadas do monólito.`);
      return { importados, jaFeito: false };
    } catch (erro) {
      console.warn(`[social] importação adiada (${i}/${tentativas}): ${erro.message}`);
      await espera(esperaMs);
    }
  }
  console.error("[social] não consegui importar do monólito; tento de novo na próxima inicialização.");
  return { importados: 0, jaFeito: false, falhou: true };
}
