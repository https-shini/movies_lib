import { Outlet, ScrollRestoration } from "react-router";
import AppHeader from "./components/layout/AppHeader";
import MobileTabBar from "./components/layout/MobileTabBar";
import Observability from "./components/layout/Observability";
import SiteFooter from "./components/layout/SiteFooter";

function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <AppHeader />
      <div id="main-content" className="app__content" tabIndex={-1}>
        <Outlet />
      </div>
      <SiteFooter />
      <MobileTabBar />
      <ScrollRestoration />
      <Observability />
    </div>
  );
}

export default App;
