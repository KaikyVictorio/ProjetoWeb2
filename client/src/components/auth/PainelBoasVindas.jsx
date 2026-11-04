// Lado esquerdo das telas de login e cadastro: apresenta o app e as três categorias
// (livro, série, jogo) com as cores de cada tipo de obra.

// Estampas das "capas" de exemplo. Os mesmos padrões das referências de design.
const ESTAMPAS = {
  livro: {
    backgroundImage:
    "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl__-vIb_Uyw05o7Rao1VVKtszF5QqBHN2vId89-fdIDNpcRZGtPWiDAgX&s=10)'",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  serie: {
    backgroundImage:
    "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAe2EogA5YYshdojGE7ya3RnW63v4OCcPSUwbpOAoPT5YP7C3QUiH91QU&s=10'",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  jogo: {
    backgroundImage:
    "url('https://m.media-amazon.com/images/M/MV5BZDQ0ZDkzZjctNGMzMy00NzBiLWFlOTQtZmM3NDU5ZjQxNWQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
};
const CAPAS_EXEMPLO = [
  { id: "capa-livro", tipo: "livro", etiqueta: "LIVRO", rotacao: "-rotate-6", deslocamento: "translate-y-4" },
  { id: "capa-serie", tipo: "serie", etiqueta: "SÉRIE", rotacao: "rotate-2", deslocamento: "-translate-y-2" },
  { id: "capa-jogo", tipo: "jogo", etiqueta: "JOGO", rotacao: "rotate-6", deslocamento: "translate-y-6" },
];

// Textos do painel em cada tela
const TEXTOS = {
  login: {
    chamada: "diário de leituras, séries e jogos",
    antes: "Tudo o que você ",
    destaque: "lê, assiste e joga",
    depois: ", num só lugar.",
    descricao:
      "Avalie o que terminou, acompanhe o que está consumindo agora e guarde na wishlist o que vem depois.",
  },
  cadastro: {
    chamada: "crie seu perfil em 1 minuto",
    antes: "Comece seu ",
    destaque: "diário",
    depois: " de leituras, séries e jogos.",
    descricao:
      "Registre o que já consumiu, monte sua lista de favoritos e mostre no perfil o que está acompanhando agora.",
  },
};

export default function PainelBoasVindas({ variante = "login" }) {
  const texto = TEXTOS[variante] ?? TEXTOS.login;

  return (
    <aside id="painel-boas-vindas" className="hidden flex-col justify-center gap-10 lg:flex">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{texto.chamada}</p>
        <h1 className="my-0! text-4xl! font-bold! leading-tight! tracking-normal! text-balance">
          {texto.antes}
          <span className="marca-texto">{texto.destaque}</span>
          {texto.depois}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-neutral-600">{texto.descricao}</p>
      </div>

      <ul id="lista-capas-exemplo" className="flex items-end gap-5" aria-label="Tipos de obra">
        {CAPAS_EXEMPLO.map((capa) => (
          <li
            key={capa.id}
            id={capa.id}
            className={`card-retro w-37 overflow-hidden ${capa.rotacao} ${capa.deslocamento}`}
          >
            <div className="relative h-55" style={ESTAMPAS[capa.tipo]}>
              <span className="absolute left-2 top-2 rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-[10px] font-bold">
                {capa.etiqueta}
              </span>
            </div>
            <div className="border-t-2 border-tinta bg-white px-3 py-2">
              <span className="block h-1.5 w-full rounded-full bg-neutral-200">
                <span className="block h-full w-2/3 rounded-full bg-destaque" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
