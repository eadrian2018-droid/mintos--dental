import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App";

import "./index.css";

import "./styles/theme.css";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  LanguageProvider,
} from "./context/LanguageContext";

import {
  ThemeProvider,
} from "./context/ThemeContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(

  <React.StrictMode>

    <BrowserRouter>

      <LanguageProvider>

        <ThemeProvider>

          <AuthProvider>

            <App />

          </AuthProvider>

        </ThemeProvider>

      </LanguageProvider>

    </BrowserRouter>

  </React.StrictMode>

);