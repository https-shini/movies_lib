import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useLocation } from "react-router";
import { redactEvent, toAnalyticsRoute } from "../../lib/analytics";

/**
 * Vercel Web Analytics e Speed Insights, sem cookies e sem o termo de busca.
 * A rota agrupa páginas dinâmicas (/movie/[id]) nos relatórios.
 */
const Observability = () => {
  const { pathname } = useLocation();
  const route = toAnalyticsRoute(pathname);

  return (
    <>
      <Analytics route={route} path={pathname} beforeSend={redactEvent} />
      <SpeedInsights route={route} beforeSend={redactEvent} />
    </>
  );
};

export default Observability;
