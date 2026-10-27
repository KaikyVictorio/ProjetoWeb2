import { pathToFileURL } from "node:url";
import { db, transacao } from "./db.js";
import { gerarHash } from "./auth.js";

// Dados de exemplo (baseados nos mocks que existiam no front).
// Só roda quando o banco está vazio. Login de teste: ana@email.com / 123456

const SENHA_PADRAO = "123456";

const OBRAS = [
  // livros
  { k: "duna", titulo: "Duna", ano: 1965, categoria: "livro", autor: "Frank Herbert", generos: ["Ficção científica"] },
  { k: "1984", titulo: "1984", ano: 1949, categoria: "livro", autor: "George Orwell", generos: ["Distopia"], imagem: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1327144697i/3744438.jpg" },
  { k: "alice", titulo: "Alice no País das Maravilhas", ano: 1865, categoria: "livro", autor: "Lewis Carroll", generos: ["Fantasia"], imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTya4rD1HazQbJd2QlE7kPyC_5kOfOtDkj5SJLwe9mPoKHAwsbgjXpKjTI&s=10" },
  { k: "neuromancer", titulo: "Neuromancer", ano: 1984, categoria: "livro", autor: "William Gibson", generos: ["Cyberpunk"], imagem: "https://m.media-amazon.com/images/I/91Bx5ilP+EL.jpg" },
  { k: "onepiece", titulo: "One Piece", ano: 1999, categoria: "livro", autor: "Eiichiro Oda", generos: ["Mangá", "Aventura"], imagem: "https://img.assinaja.com/assets/tZ/099/img/457541_520x520.png" },
  { k: "hobbit", titulo: "O Hobbit", ano: 1937, categoria: "livro", autor: "J.R.R. Tolkien", generos: ["Fantasia"] },
  // séries
  { k: "andor", titulo: "Andor", ano: 2022, categoria: "serie", autor: "Tony Gilroy", generos: ["Ficção científica"] },
  { k: "severance", titulo: "Severance", ano: 2022, categoria: "serie", autor: "Dan Erickson", generos: ["Suspense", "Ficção científica"] },
  { k: "twinpeaks", titulo: "Twin Peaks", ano: 1990, categoria: "serie", autor: "Mark Frost e David Lynch", generos: ["Mistério"], imagem: "https://ingresso-a.akamaihd.net/prd/img/movie/maratona-twin-peaks/c42898a4-ee6e-475d-9de8-3ba0e06a995a.webp" },
  { k: "dark", titulo: "Dark", ano: 2017, categoria: "serie", autor: "Baran bo Odar e Jantje Friese", generos: ["Ficção científica", "Mistério"], imagem: "https://thumb.wikimedia.org/wikipedia/pt/thumb/f/f6/Dark_%28s%C3%A9rie%29.jpg/250px-Dark_%28s%C3%A9rie%29.jpg?utm_source=pt.wikipedia.org&utm_campaign=parser&utm_content=thumbnail" },
  { k: "arcane", titulo: "Arcane", ano: 2021, categoria: "serie", autor: "Christian Linke e Alex Yee", generos: ["Animação", "Fantasia"], imagem: "https://m.media-amazon.com/images/M/MV5BYjA2NzhlMDItNWRmZC00MzRjLWE3ZjAtZjBlZDAwOWY2ODdjXkEyXkFqcGc@._V1_.jpg" },
  { k: "screamqueens", titulo: "Scream Queens", ano: 2015, categoria: "serie", autor: "Ryan Murphy, Brad Falchuk e Ian Brennan", generos: ["Comédia", "Terror"], imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSztG_WRnQ6GP1GNpCXv_oRmrPx9dmneix3rBX0XA135wQrkRwnwwvvLOnZ&s=10" },
  // jogos
  { k: "hades", titulo: "Hades", ano: 2020, categoria: "jogo", autor: "Supergiant Games", generos: ["Roguelike", "Ação"] },
  {
    k: "balatro", titulo: "Balatro", ano: 2024, categoria: "jogo", autor: "LocalThunk",
    generos: ["Card game", "Puzzle Video Game", "Casual Game", "Strategy Video Game"],
    sinopse: "O roguelike de póquer. Balatro é um jogo de construção de baralhos de cartas hipnoticamente satisfatório onde vais jogar mãos de póquer ilegais, descobrir jóqueres que vão mudar o rumo do jogo e fazer combinações empolgantes.",
    imagem: "https://store-images.s-microsoft.com/image/apps.51959.14272217582130616.02bf9982-d980-42d9-93e6-372b4b7e36d8.31c1e585-05c9-4f32-b695-4b900c913466",
  },
  { k: "hollowknight", titulo: "Hollow Knight", ano: 2017, categoria: "jogo", autor: "Team Cherry", generos: ["Metroidvania"], imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgSMdJQpPKKJUMkoUuDbOQeQlz-eBKHH4nNaLGd7dgzw&s=10" },
  { k: "silksong", titulo: "Hollow Knight: Silksong", ano: 2025, categoria: "jogo", autor: "Team Cherry", generos: ["Metroidvania"] },
  { k: "celeste", titulo: "Celeste", ano: 2018, categoria: "jogo", autor: "Maddy Makes Games", generos: ["Plataforma"] },
  { k: "stardew", titulo: "Stardew Valley", ano: 2016, categoria: "jogo", autor: "ConcernedApe", generos: ["Simulação"], imagem: "https://m.media-amazon.com/images/M/MV5BZTFkYWZlYjYtMTgwYi00ZWUyLThhYzUtYTkzNjVkOTZlMjdhXkEyXkFqcGc@._V1_.jpg" },
  { k: "cuphead", titulo: "Cuphead", ano: 2017, categoria: "jogo", autor: "Studio MDHR", generos: ["Run and gun"], imagem: "https://store-images.s-microsoft.com/image/apps.37905.13670972585585116.7f29dc82-c969-4e89-aaf9-7c0e3f52d890.2e5a9c92-cf00-4c10-ae28-264c564478c3" },
];

const USUARIOS = [
  {
    k: "ana", nome: "Ana Silva", usuario: "ana_banana", email: "ana@email.com",
    bio: "and the universe said: you're the universe tasting itself, reading its own code.",
    foto: "https://media.istockphoto.com/id/823231784/pt/vetorial/person-icon-profile-icon-isolated-vector.jpg?s=170667a&w=0&k=20&c=Z8668GgeTNf_Vo3ijkb0_0F6KOdkRd3yZAhC5zc_n2c=",
    infos: [{ rotulo: "idade", valor: "20" }, { rotulo: "from", valor: "Brazil" }],
  },
  { k: "anasouza", nome: "Ana Souza", usuario: "anasouza", email: "anasouza@email.com" },
  { k: "bruno", nome: "Bruno Lima", usuario: "brunolima", email: "brunolima@email.com" },
  { k: "carla", nome: "Carla Mendes", usuario: "carlam", email: "carlam@email.com" },
  { k: "diego", nome: "Diego Alves", usuario: "diegoalves", email: "diegoalves@email.com" },
];

export function popularSeVazio() {
  if (db.prepare("SELECT COUNT(*) AS n FROM obras").get().n > 0) return false;

  const ano = new Date().getFullYear();
  const dia = (mes, d) => `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const obra = {};
  const usuario = {};

  transacao(() => {
    const hash = gerarHash(SENHA_PADRAO);
    for (const u of USUARIOS) {
      usuario[u.k] = db
        .prepare("INSERT INTO usuarios (nome, usuario, email, senha_hash, foto, bio, infos) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(u.nome, u.usuario, u.email, hash, u.foto ?? "", u.bio ?? "", JSON.stringify(u.infos ?? [])).lastInsertRowid;
    }

    for (const o of OBRAS) {
      obra[o.k] = db
        .prepare("INSERT INTO obras (titulo, ano, categoria, imagem, autor, generos, sinopse) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(o.titulo, o.ano, o.categoria, o.imagem ?? null, o.autor, JSON.stringify(o.generos ?? []), o.sinopse ?? "").lastInsertRowid;
    }

    const ana = usuario.ana;

    // Logs da Ana (atividade recente, acervo e estatísticas)
    const log = (u, o, data, { nota = 0, texto = "", spoiler = 0, jaFeito = 0 } = {}) => {
      db.prepare("INSERT INTO logs (usuario_id, obra_id, nota, texto, spoiler, ja_feito, data) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(u, obra[o], nota, texto, spoiler, jaFeito, data);
      if (nota > 0) {
        db.prepare("INSERT INTO notas (usuario_id, obra_id, nota) VALUES (?, ?, ?) ON CONFLICT (usuario_id, obra_id) DO UPDATE SET nota = excluded.nota")
          .run(u, obra[o], nota);
      }
    };
    log(ana, "duna", dia(10, 15), { nota: 4.5, texto: "Um clássico que merece a fama. A construção de mundo é impressionante." });
    log(ana, "andor", dia(10, 14), { nota: 4 });
    log(ana, "silksong", dia(10, 13));
    log(ana, "balatro", dia(10, 10), { nota: 4, jaFeito: 1 });
    log(ana, "1984", dia(9, 28), { nota: 5, texto: "Atual demais para um livro de 1949." });
    log(ana, "hades", dia(9, 12), { nota: 4.5 });
    log(ana, "dark", dia(8, 30), { nota: 4 });
    log(ana, "hobbit", dia(8, 2), { nota: 4 });

    // Reviews da comunidade em Balatro
    log(usuario.anasouza, "balatro", dia(10, 9), { nota: 4.5, texto: "Um clássico que merece a fama." });
    log(usuario.bruno, "balatro", dia(10, 8), { nota: 4, texto: "O final mexeu comigo.", spoiler: 1 });
    log(usuario.carla, "balatro", dia(10, 7), { nota: 5, texto: "Gostei!!" });
    log(usuario.diego, "severance", dia(10, 6), { nota: 5, texto: "Que série. Terminei em dois dias." });

    // Favoritos, rotação e wishlist da Ana
    for (const o of ["alice", "1984", "twinpeaks", "hollowknight", "celeste", "hades", "balatro", "stardew"]) {
      db.prepare("INSERT INTO favoritos (usuario_id, obra_id) VALUES (?, ?)").run(ana, obra[o]);
    }
    for (const o of ["onepiece", "neuromancer", "cuphead", "twinpeaks", "dark", "arcane", "screamqueens"]) {
      db.prepare("INSERT INTO rotacao (usuario_id, obra_id) VALUES (?, ?)").run(ana, obra[o]);
    }
    for (const o of ["duna", "severance", "celeste"]) {
      db.prepare("INSERT INTO wishlist (usuario_id, obra_id) VALUES (?, ?)").run(ana, obra[o]);
    }

    // Listas da Ana
    const listas = [
      ["Favoritos do momento", "Tudo que eu mais amei nos últimos meses, de livros a jogos. Uma lista para quem quer conhecer meu gosto.", ["duna", "1984", "andor", "severance", "hades"]],
      ["Para ler em 2026", "", ["1984", "severance", "balatro"]],
      ["Jogos de fim de semana", "", ["hades"]],
      ["Séries que me marcaram", "", ["andor", "severance"]],
      ["Releituras", "Livros que eu leria de novo.", ["duna", "1984"]],
      ["Clássicos", "O básico bem feito.", ["duna"]],
    ];
    for (const [titulo, descricao, obras] of listas) {
      const id = db.prepare("INSERT INTO listas (usuario_id, titulo, descricao) VALUES (?, ?, ?)").run(ana, titulo, descricao).lastInsertRowid;
      obras.forEach((o, i) => db.prepare("INSERT INTO lista_obras (lista_id, obra_id, posicao) VALUES (?, ?, ?)").run(id, obra[o], i));
    }

    // Quem segue quem
    for (const [a, b] of [["ana", "anasouza"], ["ana", "bruno"], ["anasouza", "ana"], ["bruno", "ana"], ["carla", "ana"]]) {
      db.prepare("INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)").run(usuario[a], usuario[b]);
    }
  });

  console.log(`[seed] Banco populado. Login de teste: ana@email.com / ${SENHA_PADRAO}`);
  return true;
}

// `npm run seed` roda este arquivo direto
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!popularSeVazio()) console.log("[seed] O banco já tem dados; nada a fazer.");
}
