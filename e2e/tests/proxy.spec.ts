import { expect, test, type APIResponse } from "@playwright/test";

/**
 * Proxy /api/tmdb servido pelo `vite preview` (mesmo código da função da Vercel).
 *
 * O servidor dos testes roda sem TMDB_API_KEY (playwright.config.ts), então nenhuma
 * consulta chega ao TMDB: estes testes cobrem só o que o proxy decide sozinho.
 * O cache da CDN da Vercel não existe aqui; o que se verifica é o Cache-Control que o
 * proxy envia, do qual a CDN depende para nunca guardar erros.
 */

async function expectJsonError(response: APIResponse, status: number, code: string) {
  expect(response.status()).toBe(status);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(response.headers()["cache-control"], "erros nunca entram no cache").toBe("no-store");
  expect(await response.json()).toMatchObject({ code });
}

test.describe("Proxy do TMDB (local, sem chave)", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
    test(`${method} recebe 405 e o cabeçalho Allow`, async ({ request }) => {
      const response = await request.fetch("/api/tmdb/genre/movie/list", { method });

      expect(response.status()).toBe(405);
      expect(response.headers().allow).toBe("GET");
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(await response.json()).toMatchObject({ code: "method_not_allowed" });
      // Achado do Bloco B (D-36): o 405 é o único erro do proxy sem `Cache-Control: no-store`.
      // Não há risco de cache (a CDN só guarda GET e HEAD), mas a correção fica registrada.
      // Quando o proxy passar a enviar no-store aqui, troque esta linha pela verificação de no-store.
      expect(response.headers()["cache-control"]).toBeUndefined();
    });
  }

  const unknownEndpoints = [
    "/api/tmdb/person/1",
    "/api/tmdb/configuration",
    "/api/tmdb/movie/550/images",
    "/api/tmdb/movie/abc",
    "/api/tmdb/movie/550/..%2F..%2Fperson%2F1",
    "/api/tmdb?path=person/1",
  ];
  for (const path of unknownEndpoints) {
    test(`endpoint fora da lista recebe 404: ${path}`, async ({ request }) => {
      await expectJsonError(await request.get(path), 404, "unknown_endpoint");
    });
  }

  const allowedEndpoints = [
    "/api/tmdb/genre/movie/list?language=pt-BR",
    "/api/tmdb/movie/popular?language=pt-BR&region=BR",
    "/api/tmdb/movie/550/watch/providers",
    "/api/tmdb?path=movie/550",
  ];
  for (const path of allowedEndpoints) {
    test(`endpoint permitido sem chave no servidor recebe missing_server_key: ${path}`, async ({
      request,
    }) => {
      await expectJsonError(await request.get(path), 500, "missing_server_key");
    });
  }

  test("uma api_key enviada pelo cliente não substitui a chave do servidor", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/tmdb/genre/movie/list?api_key=chave-falsa-do-cliente&language=pt-BR",
    );

    await expectJsonError(response, 500, "missing_server_key");
    expect(await response.text()).not.toContain("chave-falsa-do-cliente");
  });

  test("o erro repetido continua sem cache", async ({ request }) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request.get("/api/tmdb/person/1");
      expect(response.headers()["cache-control"]).toBe("no-store");
      expect(response.headers()["cache-control"]).not.toContain("s-maxage");
    }
  });
});
