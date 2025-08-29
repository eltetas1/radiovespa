// src/main.tsx

import PoliticaCookies from "./pages/PoliticaCookies";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";

// 👇 SIN ESTO NO SE APLICA TAILWIND
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/politica-de-cookies", element: <PoliticaCookies /> }, // ✅ NUEVA RUTA
]);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
