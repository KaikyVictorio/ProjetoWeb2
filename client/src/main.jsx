import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { LogsProvider } from "./context/LogsContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <LogsProvider>
      <App />
    </LogsProvider>
    </BrowserRouter>
  </StrictMode>
);