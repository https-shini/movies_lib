import type { Page, Route } from "@playwright/test";
import * as fixtures from "../fixtures/index.ts";

/**
 * Simulação do proxy /api/tmdb no navegador (page.route).
 *
 * O app chama apenas /api/tmdb/<endpoint>?<parâmetros> (src/services/tmdb.ts). Aqui cada
 * endpoint recebe uma fixture local; nada sai para a rede e nenhuma chave é usada.
 * Um teste pode trocar a resposta de um endpoint com `tmdb.on(...)`.
 */

export interface MockResponse {
  status?: number;
  body?: unknown;
  /** Segura a resposta até a promessa resolver (para observar o carregamento). */
  waitFor?: Promise<void>;
}

type Responder = MockResponse | ((url: URL) => MockResponse);

interface Override {
  match: (path: string) => boolean;
  respond: Responder;
  remaining: number;
}

export interface TmdbMock {
  /**
   * Troca a resposta de um endpoint do TMDB (ex.: "movie/popular" ou /^search\//).
   * Com `times`, a troca vale só para as próximas N chamadas; depois volta a fixture padrão.
   */
  on(path: string | RegExp, respond: Responder, options?: { times?: number }): void;
  /** Chamadas recebidas pelo proxy simulado, na ordem. */
  readonly calls: readonly URL[];
  /** Chamadas a um endpoint específico. */
  callsTo(path: string): URL[];
  /** Endpoints pedidos pelo app que não têm fixture (devem ficar vazios). */
  readonly unknown: readonly string[];
}

export const PROXY_PREFIX = "/api/tmdb/";

const json = (body: unknown, status = 200): MockResponse => ({ status, body });

/** Respostas padrão, equivalentes a um TMDB que funciona. */
function defaultResponse(path: string, url: URL): MockResponse | null {
  const page = Number(url.searchParams.get("page") ?? "1");

  if (/^movie\/(popular|top_rated|now_playing)$/.test(path)) return json(fixtures.movies);
  if (path === "genre/movie/list") return json(fixtures.genres);

  if (path === "search/movie") {
    const query = (url.searchParams.get("query") ?? "").toLowerCase();
    if (query === "duna") return json(page >= 2 ? fixtures.searchDuna[2] : fixtures.searchDuna[1]);
    return json(fixtures.emptyPage);
  }

  if (path === "discover/movie") {
    const results = page >= 2 ? fixtures.discover[2] : fixtures.discover[1];
    return json({ ...results, page });
  }

  // Onde assistir chega junto com os detalhes; o endpoint separado não tem fixture
  // de propósito: se o app voltar a pedi-lo, o teste falha.
  if (path === "movie/550") return json(fixtures.movie550);

  const details = /^movie\/(\d+)$/.exec(path);
  if (details) {
    const summary = fixtures.findMovie(Number(details[1]));
    return summary ? json(fixtures.detailsFrom(summary)) : json(fixtures.tmdbNotFound, 404);
  }

  // Séries, pessoas e coleções ------------------------------------------------
  if (path === "tv/popular" || path === "discover/tv") return json(fixtures.tvShows);
  if (path === "genre/tv/list") return json(fixtures.tvGenres);
  if (path === "person/popular") return json({ ...fixtures.people, page });

  const query = (url.searchParams.get("query") ?? "").toLowerCase();
  if (path === "search/tv") {
    return json(query === "duna" ? fixtures.searchTvDuna : fixtures.emptyPage);
  }
  if (path === "search/person") {
    return json(query === "brad" ? fixtures.searchPersonBrad : fixtures.emptyPage);
  }

  if (path === "tv/1396") return json(fixtures.tv1396);
  if (path === "tv/1396/season/1") return json(fixtures.tv1396Season1);
  if (/^tv\/\d+\/season\/\d+$/.test(path)) return json(fixtures.tmdbNotFound, 404);
  if (path === "person/287") return json(fixtures.person287);
  if (path === "person/7467") {
    const english = url.searchParams.get("language") === "en-US";
    return json(english ? fixtures.person7467English : fixtures.person7467);
  }
  if (path === "collection/2344") return json(fixtures.collection2344);
  if (/^(tv|person|collection)\/\d+$/.test(path)) return json(fixtures.tmdbNotFound, 404);

  return null;
}

export async function installTmdbMock(page: Page): Promise<TmdbMock> {
  const overrides: Override[] = [];
  const calls: URL[] = [];
  const unknown: string[] = [];

  const fulfill = async (route: Route, response: MockResponse): Promise<void> => {
    if (response.waitFor) await response.waitFor;
    await route.fulfill({
      status: response.status ?? 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(response.body ?? null),
    });
  };

  await page.route(`**${PROXY_PREFIX}**`, async (route) => {
    const url = new URL(route.request().url());
    const path = decodeURIComponent(url.pathname.slice(PROXY_PREFIX.length));
    calls.push(url);

    const override = overrides.find((item) => item.remaining > 0 && item.match(path));
    if (override) {
      override.remaining -= 1;
      const response =
        typeof override.respond === "function" ? override.respond(url) : override.respond;
      await fulfill(route, response);
      return;
    }

    const response = defaultResponse(path, url);
    if (!response) {
      unknown.push(path);
      await fulfill(route, json({ code: "unknown_endpoint" }, 404));
      return;
    }
    await fulfill(route, response);
  });

  return {
    on(path, respond, { times = Number.POSITIVE_INFINITY } = {}) {
      const match =
        typeof path === "string"
          ? (value: string) => value === path
          : (value: string) => path.test(value);
      // A troca mais recente tem prioridade.
      overrides.unshift({ match, respond, remaining: times });
    },
    calls,
    callsTo: (path) =>
      calls.filter((url) => decodeURIComponent(url.pathname.slice(PROXY_PREFIX.length)) === path),
    unknown,
  };
}
