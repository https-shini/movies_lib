// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as api from "./tmdb";

describe("função da Vercel (api/tmdb.ts)", () => {
  it("exporta GET e encaminha os demais métodos ao proxy, que responde 405", async () => {
    expect(typeof api.GET).toBe("function");

    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const) {
      const response = await api[method](
        new Request("https://cinelux.test/api/tmdb/genre/movie/list", { method }),
      );
      expect(response.status, method).toBe(405);
      expect(response.headers.get("Allow"), method).toBe("GET");
      expect(response.headers.get("Cache-Control"), method).toBe("no-store");
    }
  });
});
