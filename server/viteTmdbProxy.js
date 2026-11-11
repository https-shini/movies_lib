import { handleTmdbProxy } from "./tmdbProxy.js";

const PROXY_PATH = "/api/tmdb";

/**
 * Plugin do Vite que serve /api/tmdb em `npm run dev` e `npm run preview`,
 * reproduzindo localmente a função serverless da Vercel.
 */
export function tmdbDevProxy({ apiKey }) {
  const middleware = async (req, res, next) => {
    if (!req.url?.startsWith(PROXY_PATH) || (req.url.length > PROXY_PATH.length && !"?/".includes(req.url[PROXY_PATH.length]))) {
      next();
      return;
    }

    try {
      const request = new Request(new URL(req.url, "http://localhost"), { method: req.method });
      const response = await handleTmdbProxy(request, { apiKey });

      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(await response.text());
    } catch (error) {
      next(error);
    }
  };

  return {
    name: "tmdb-dev-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
