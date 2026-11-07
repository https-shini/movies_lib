import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { handleTmdbProxy } from "./tmdbProxy.ts";

const PROXY_PATH = "/api/tmdb";

type Next = (error?: unknown) => void;

function isProxyRequest(url: string | undefined): url is string {
  if (!url?.startsWith(PROXY_PATH)) return false;
  const nextChar = url.charAt(PROXY_PATH.length);
  return nextChar === "" || nextChar === "?" || nextChar === "/";
}

/**
 * Plugin do Vite que serve /api/tmdb em `npm run dev` e `npm run preview`,
 * reproduzindo localmente a função serverless da Vercel.
 */
export function tmdbDevProxy({ apiKey }: { apiKey: string | undefined }): Plugin {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: Next): void => {
    if (!isProxyRequest(req.url)) {
      next();
      return;
    }

    const request = new Request(new URL(req.url, "http://localhost"), {
      method: req.method ?? "GET",
    });

    handleTmdbProxy(request, { apiKey })
      .then(async (response) => {
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      })
      .catch(next);
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
