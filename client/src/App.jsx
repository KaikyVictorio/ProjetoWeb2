import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Perfil from "./pages/Perfil";
import PerfilInicio from "./pages/perfil/PerfilInicio";
import PerfilLogs from "./pages/perfil/PerfilLogs";
import PerfilFavoritos from "./pages/perfil/PerfilFavoritos";
import PerfilAcervo from "./pages/perfil/PerfilAcervo";
import PerfilWishlist from "./pages/perfil/PerfilWishlist";
import PerfilWishlistCategoria from "./pages/perfil/PerfilWishlistCategoria";
import Busca from "./pages/Busca";
import Obra from "./pages/Obra";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/perfil" element={<Perfil />}>
            <Route index element={<PerfilInicio />} />
            <Route path="logs" element={<PerfilLogs />} />
            <Route path="favoritos" element={<PerfilFavoritos />} />
            <Route path="acervo" element={<PerfilAcervo />} />
            <Route path="wishlist" element={<PerfilWishlist />} />
            <Route path="wishlist/:slug" element={<PerfilWishlistCategoria />} />
          </Route>
          <Route path="/busca" element={<Busca />} />
          <Route path="/obras/:id" element={<Obra />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}