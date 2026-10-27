import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Termos from "./pages/Termos";
import RecuperarSenha from "./pages/RecuperarSenha";
import { PerfilMeu, PerfilPublico } from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import PerfilInicio from "./pages/perfil/PerfilInicio";
import PerfilLogs from "./pages/perfil/PerfilLogs";
import PerfilFavoritos from "./pages/perfil/PerfilFavoritos";
import PerfilAcervo from "./pages/perfil/PerfilAcervo";
import PerfilWishlist from "./pages/perfil/PerfilWishlist";
import PerfilWishlistCategoria from "./pages/perfil/PerfilWishlistCategoria";
import PerfilListas from "./pages/perfil/PerfilListas";
import Busca from "./pages/Busca";
import Obra from "./pages/Obra";
import ObraForm from "./pages/ObraForm";
import Listas from "./pages/Listas";
import Lista from "./pages/Lista";
import ListaForm from "./pages/ListaForm";
import { ROTAS } from "./rotas";

// Páginas internas do perfil: as mesmas servem para /perfil (meu) e /usuarios/:id (de outras pessoas)
const paginasDoPerfil = (
  <>
    <Route index element={<PerfilInicio />} />
    <Route path="logs" element={<PerfilLogs />} />
    <Route path="favoritos" element={<PerfilFavoritos />} />
    <Route path="acervo" element={<PerfilAcervo />} />
    <Route path="wishlist" element={<PerfilWishlist />} />
    <Route path="wishlist/:slug" element={<PerfilWishlistCategoria />} />
    <Route path="listas" element={<PerfilListas />} />
  </>
);

const protegida = (elemento) => <RequireAuth>{elemento}</RequireAuth>;

export default function App() {
  // Login e cadastro têm layout próprio (sem navbar e rodapé)
  const { pathname } = useLocation();
  const telaDeAutenticacao = pathname === ROTAS.login || pathname === ROTAS.cadastro;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {!telaDeAutenticacao && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />

          <Route path={ROTAS.login} element={<Login />} />
          <Route path={ROTAS.cadastro} element={<Cadastro />} />
          <Route path={ROTAS.termos} element={<Termos />} />
          <Route path={ROTAS.esqueciSenha} element={<RecuperarSenha />} />

          <Route path="/perfil" element={protegida(<PerfilMeu />)}>{paginasDoPerfil}</Route>
          <Route path="/perfil/editar" element={protegida(<EditarPerfil />)} />
          <Route path="/usuarios/:id" element={<PerfilPublico />}>{paginasDoPerfil}</Route>

          <Route path="/busca" element={<Busca />} />
          <Route path="/obras/nova" element={protegida(<ObraForm />)} />
          <Route path="/obras/:id" element={<Obra />} />
          <Route path="/obras/:id/editar" element={protegida(<ObraForm />)} />

          <Route path="/listas" element={<Listas />} />
          <Route path="/listas/nova" element={protegida(<ListaForm />)} />
          <Route path="/listas/:id" element={<Lista />} />
          <Route path="/listas/:id/editar" element={protegida(<ListaForm />)} />

          <Route path="*" element={<p className="p-10 font-mono">Página não encontrada.</p>} />
        </Routes>
      </main>
      {!telaDeAutenticacao && <Footer />}
    </div>
  );
}
