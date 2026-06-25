import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { DomainDataProvider } from "./contexts/DomainDataContext";
import { ToastProvider } from "./contexts/ToastContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <DomainDataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DomainDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
