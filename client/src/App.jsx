import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Perfil from "./pages/Perfil";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}