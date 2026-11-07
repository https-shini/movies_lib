/**
 * Regras de privacidade e agrupamento para Vercel Web Analytics e Speed Insights.
 */

/** Parâmetros que podem conter texto digitado pela pessoa e não são enviados. */
const PRIVATE_PARAMS = ["q"] as const;

/** Agrupa rotas dinâmicas: /movie/550 → /movie/[id]. */
export function toAnalyticsRoute(pathname: string): string {
  if (/^\/movie\/[^/]+\/?$/.test(pathname)) return "/movie/[id]";
  return pathname;
}

/** Remove termos de busca da URL antes do envio. */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const param of PRIVATE_PARAMS) parsed.searchParams.delete(param);
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Middleware `beforeSend` dos dois pacotes: mantém o evento, sem o termo de busca. */
export function redactEvent<T extends { url: string }>(event: T): T {
  return { ...event, url: redactUrl(event.url) };
}
