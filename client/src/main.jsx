import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { LogsProvider } from "./context/LogsContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LogsProvider>
          <App />
        </LogsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
