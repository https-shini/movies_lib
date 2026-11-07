import { handleTmdbProxy } from "../server/tmdbProxy.js";

/**
 * Função serverless da Vercel: GET /api/tmdb?path=movie/popular&language=pt-BR
 * Configure TMDB_API_KEY (tipo Secret) nas variáveis de ambiente do projeto.
 */
export function GET(request) {
  return handleTmdbProxy(request, { apiKey: process.env.TMDB_API_KEY });
}
