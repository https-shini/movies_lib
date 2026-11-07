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
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
