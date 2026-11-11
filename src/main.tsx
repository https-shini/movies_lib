// Estilos globais primeiro, para que os estilos dos componentes tenham precedência.
import "./styles/fonts.css";
import "./styles/base.css";
import "./styles/typography.css";
import "./styles/ui.css";
import "./styles/layout.css";

import { StrictMode, type ComponentType } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "./App";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import RouteError from "./pages/RouteError";
import RouteFallback from "./pages/RouteFallback";
import { prefetchDiscover, prefetchHome, prefetchMovie, prefetchSearch } from "./services/prefetch";

/**
 * Início e 404 ficam no pacote principal; as demais páginas são carregadas sob demanda
 * (D-41). Os loaders só disparam o pré-carregamento dos dados e devolvem null na hora.
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteError />,
    HydrateFallback: RouteFallback,
    children: [
      {
        // Mantém a navegação visível se uma página falhar ao renderizar.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Home />, loader: prefetchHome },
          {
            path: "discover",
            lazy: page(() => import("./pages/Discover")),
            loader: ({ request }) => prefetchDiscover(request),
          },
          {
            path: "movie/:id",
            lazy: page(() => import("./pages/Movie")),
            loader: ({ params }) => prefetchMovie(params.id),
          },
          {
            path: "search",
            lazy: page(() => import("./pages/Search")),
            loader: ({ request }) => prefetchSearch(request),
          },
          { path: "sobre", lazy: page(() => import("./pages/About")) },
          { path: "privacidade", lazy: page(() => import("./pages/Privacy")) },
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
