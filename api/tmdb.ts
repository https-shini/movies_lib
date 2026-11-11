// Extensão .js: a Vercel compila este arquivo e o proxy para JavaScript e
// mantém o caminho do import como está (ver docs/DECISIONS.md, D-15).
import { handleTmdbProxy } from "../server/tmdbProxy.js";

/**
 * Função serverless da Vercel: GET /api/tmdb/<endpoint>?<parâmetros>
 * Ex.: /api/tmdb/movie/550?language=pt-BR
 * O vercel.json reescreve /api/tmdb/<endpoint> para esta função
 * (rotas coringa em api/ não funcionam fora do Next.js; ver D-08).
 * A chave fica em TMDB_API_KEY (tipo Secret) e nunca chega ao navegador.
 */
function handler(request: Request): Promise<Response> {
  return handleTmdbProxy(request, { apiKey: process.env.TMDB_API_KEY });
}

export const GET = handler;

// Os demais métodos também passam pelo proxy, que responde 405 com `Allow: GET` e
// `Cache-Control: no-store`. Sem estes exports, a Vercel responderia o 405 sozinha,
// sem esses cabeçalhos (D-43).
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
