import { expect, test } from "@playwright/test";
import vercelConfig from "../../vercel.json" with { type: "json" };

/**
 * Cabeçalhos de segurança: o `vite preview` serve os mesmos valores do vercel.json
 * (server/securityHeaders.ts). Aqui se confere a política em si; a ausência de violações
 * da CSP é verificada em todos os testes de interface (e2e/helpers/test.ts).
 */

const rule = vercelConfig.headers.find(({ source }) => source === "/(.*)");
const expected = Object.fromEntries(
  (rule?.headers ?? []).map(({ key, value }) => [key.toLowerCase(), value]),
);

test.describe("Cabeçalhos de segurança", () => {
  for (const path of ["/", "/movie/550", "/sobre", "/rota-que-nao-existe"]) {
    test(`${path} envia os cabeçalhos do vercel.json`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);

      const headers = response.headers();
      for (const [key, value] of Object.entries(expected)) {
        expect(headers[key], key).toBe(value);
      }
    });
  }

  test("a política cobre o que o app carrega e nada além", () => {
    expect(expected["x-content-type-options"]).toBe("nosniff");
    expect(expected["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(expected["x-frame-options"]).toBe("DENY");

    const csp = expected["content-security-policy-report-only"] ?? "";
    const directives = Object.fromEntries(
      csp.split(";").map((part) => {
        const [name = "", ...values] = part.trim().split(/\s+/);
        return [name, values];
      }),
    );

    expect(directives["default-src"]).toEqual(["'self'"]);
    expect(directives["script-src"]).toEqual(["'self'"]);
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(directives["img-src"]).toContain("https://image.tmdb.org");
    expect(directives["frame-src"]).toEqual(["https://www.youtube-nocookie.com"]);
    expect(csp, "sem exceções inseguras").not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });
});
