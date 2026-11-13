import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { messages } from "./i18n";
import AppHeader from "./components/layout/AppHeader";
import MobileTabBar from "./components/layout/MobileTabBar";
import SiteFooter from "./components/layout/SiteFooter";
import { whenIdleAfterLoad } from "./lib/idle";
import { getToasts, subscribeToasts } from "./lib/toast";

// Estatísticas fora do pacote principal: carregam depois da página (D-41).
const Observability = lazy(() => import("./components/layout/Observability"));
// Avisos também fora do pacote principal: só aparecem depois de uma ação (D-63).
const Toaster = lazy(() => import("./components/ui/Toaster"));

const hasToasts = () => getToasts().length > 0;

/**
 * A região de avisos é carregada depois que a página termina de abrir, ou no primeiro
 * aviso, o que vier antes: não disputa a primeira tela, e nenhuma ação fica sem retorno.
 */
function useToasterReady(): boolean {
  const [idle, setIdle] = useState(false);
  const pending = useSyncExternalStore(subscribeToasts, hasToasts, () => false);
  useEffect(
    () =>
      whenIdleAfterLoad(() => {
        setIdle(true);
      }),
    [],
  );
  const [ready, setReady] = useState(false);
  if ((idle || pending) && !ready) setReady(true);
  return ready;
}

function App() {
  const toasterReady = useToasterReady();
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
      <ScrollRestoration />
      <Suspense fallback={null}>
        <Observability />
        {toasterReady && <Toaster />}
      </Suspense>
    </div>
  );
}

export default App;
