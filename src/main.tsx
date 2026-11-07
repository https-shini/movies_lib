// Estilos globais primeiro, para que os estilos dos componentes tenham precedência.
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/layout.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "./App";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Search from "./pages/Search";
import Discover from "./pages/Discover";
import NotFound from "./pages/NotFound";
import RouteError from "./pages/RouteError";
import About from "./pages/About";
import Privacy from "./pages/Privacy";

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteError />,
    children: [
      {
        // Mantém a navegação visível se uma página falhar ao renderizar.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Home /> },
          { path: "discover", element: <Discover /> },
          { path: "movie/:id", element: <Movie /> },
          { path: "search", element: <Search /> },
          { path: "sobre", element: <About /> },
          { path: "privacidade", element: <Privacy /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemento #root não encontrado em index.html.");

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
