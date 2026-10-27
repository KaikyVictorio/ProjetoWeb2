import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import { Carregando, MensagemErro } from "../components/Estado";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

const campo =
  "w-full rounded-md border-2 border-black bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300";

const botao =
  "rounded-sm border px-3 py-2 font-mono text-sm font-bold uppercase transition hover:translate-x-[1px] hover:translate-y-[1px]";

function Formulario({ obra }) {
  const navigate = useNavigate();
  const editando = Boolean(obra);

  const [titulo, setTitulo] = useState(obra?.titulo ?? "");
  const [categoria, setCategoria] = useState(obra?.categoria ?? "livro");
  const [ano, setAno] = useState(obra?.ano ?? "");
  const [autor, setAutor] = useState(obra?.autor ?? "");
  const [imagem, setImagem] = useState(obra?.imagem ?? "");
  const [generos, setGeneros] = useState((obra?.generos ?? []).join(", "));
  const [sinopse, setSinopse] = useState(obra?.sinopse ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const rotuloAutor = { livro: "Autor(a)", serie: "Criador(a)", jogo: "Desenvolvedora" }[categoria];

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const dados = {
      titulo: titulo.trim(),
      categoria,
      ano: ano === "" ? null : Number(ano),
      autor: autor.trim(),
      imagem: imagem.trim(),
      generos: generos.split(",").map((g) => g.trim()).filter(Boolean),
      sinopse: sinopse.trim(),
    };

    try {
      const salva = editando ? await api.put(`/obras/${obra.id}`, dados) : await api.post("/obras", dados);
      navigate(`/obras/${salva.id}`);
    } catch (e2) {
      setErro(e2.message);
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <p className="mb-5! border-b border-black pb-2 text-left font-menu font-bold text-[26px] tracking-wide">
          {editando ? "Editar obra" : "Nova obra"}
        </p>

        <form onSubmit={salvar} className="space-y-5 text-left">
          <label className="block">
            <span className="mb-1 block font-mono text-sm">Título</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={150}
              required
              className={campo}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-mono text-sm">Categoria</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo}>
                <option value="livro">Livro</option>
                <option value="serie">Série</option>
                <option value="jogo">Jogo</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-sm">Ano</span>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                min={1000}
                max={new Date().getFullYear() + 5}
                placeholder="Ex.: 2024"
                className={campo}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">{rotuloAutor}</span>
            <input value={autor} onChange={(e) => setAutor(e.target.value)} maxLength={120} className={campo} />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Link da capa (URL da imagem)</span>
            <input
              type="url"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              placeholder="https://..."
              className={campo}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Gêneros (separados por vírgula)</span>
            <input
              value={generos}
              onChange={(e) => setGeneros(e.target.value)}
              placeholder="Ex.: Ficção científica, Aventura"
              className={campo}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-sm">Sinopse</span>
            <textarea
              value={sinopse}
              onChange={(e) => setSinopse(e.target.value)}
              rows={6}
              maxLength={3000}
              className={`${campo} resize-none`}
            />
          </label>

          {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className={`${botao} p-2! border-black bg-yellow-300 text-black shadow-[2px_2px_0_0_#666] disabled:opacity-60`}
            >
              {salvando ? "salvando..." : "salvar"}
            </button>
            <Link to={editando ? `/obras/${obra.id}` : "/"} className={`${botao} p-2! border-black bg-white text-black`}>
              cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Aviso({ children }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        {children}
        <Link to="/" className="font-mono text-sm underline">voltar ao início</Link>
      </Card>
    </div>
  );
}

function EditarObra({ id }) {
  const { usuario } = useAuth();
  const { dados: obra, carregando, erro, recarregar } = useApi(() => api.get(`/obras/${id}`), [id]);

  if (carregando && !obra) return <Aviso><Carregando /></Aviso>;
  if (erro || !obra) return <Aviso><MensagemErro erro={erro || "Obra não encontrada."} onTentarDeNovo={recarregar} /></Aviso>;
  if (obra.criadoPor !== usuario.id) {
    return <Aviso><p className="font-mono">Só quem cadastrou a obra pode editá-la.</p></Aviso>;
  }
  return <Formulario key={obra.id} obra={obra} />;
}

export default function ObraForm() {
  const { id } = useParams();
  return id ? <EditarObra id={id} /> : <Formulario key="nova" obra={null} />;
}
