import { Routes, Route, Navigate } from "react-router-dom";
import { ROTAS } from "./rotas.js";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import PaginaTemporaria from "./pages/PaginaTemporaria.jsx";

// Todas as rotas do site ficam aqui.
// Os caminhos vêm de src/rotas.js.
export default function App() {
  return (
    <Routes>
      <Route path={ROTAS.login} element={<Login />} />
      <Route path={ROTAS.cadastro} element={<Cadastro />} />

      {/* Páginas ainda não feitas: troque pelo componente real quando existir */}
      <Route path={ROTAS.home} element={<PaginaTemporaria titulo="Home" />} />
      <Route path={ROTAS.esqueciSenha} element={<PaginaTemporaria titulo="Recuperar senha" />} />
      <Route path={ROTAS.termos} element={<PaginaTemporaria titulo="Termos de uso" />} />

      <Route path="*" element={<Navigate to={ROTAS.login} replace />} />
    </Routes>
  );
}
