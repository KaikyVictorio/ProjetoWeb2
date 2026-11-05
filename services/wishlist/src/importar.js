import { db, transacao } from "./db.js";
import { exportarWishlist } from "./legado.js";

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

const jaImportou = () =>
  Boolean(db.prepare("SELECT 1 FROM meta WHERE chave = 'importado_do_legado'").get());

// Copia UMA vez a wishlist que estava no banco do monólito.
// O marcador em `meta` evita ressuscitar dados antigos se a pessoa esvaziar a wishlist depois.
export async function importarDoLegado({ tentativas = 30, esperaMs = 2000 } = {}) {
  if (jaImportou()) return { importados: 0, jaFeito: true };

  for (let i = 1; i <= tentativas; i++) {
    try {
      const linhas = await exportarWishlist();
      const inserir = db.prepare(
        "INSERT OR IGNORE INTO wishlist (usuario_id, obra_id, criado_em) VALUES (?, ?, COALESCE(?, datetime('now')))"
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
      console.log(`[wishlist] ${importados} itens importados do monólito.`);
      return { importados, jaFeito: false };
    } catch (erro) {
      console.warn(`[wishlist] importação adiada (${i}/${tentativas}): ${erro.message}`);
      await espera(esperaMs);
    }
  }
  console.error("[wishlist] não consegui importar do monólito; tento de novo na próxima inicialização.");
  return { importados: 0, jaFeito: false, falhou: true };
}
