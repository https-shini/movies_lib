import { lazy, Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { messages } from "./i18n";
import AppHeader from "./components/layout/AppHeader";
import MobileTabBar from "./components/layout/MobileTabBar";
import SiteFooter from "./components/layout/SiteFooter";
import Toaster from "./components/ui/Toaster";

// Estatísticas fora do pacote principal: carregam depois da página (D-41).
const Observability = lazy(() => import("./components/layout/Observability"));

function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        {messages.common.skipToContent}
      </a>
      <AppHeader />
      <div id="main-content" className="app__content" tabIndex={-1}>
        <Outlet />
      </div>
      <SiteFooter />
      <MobileTabBar />
      <Toaster />
      <ScrollRestoration />
      <Suspense fallback={null}>
        <Observability />
      </Suspense>
    </div>
  );
}

export default App;
