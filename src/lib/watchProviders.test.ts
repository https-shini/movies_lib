import { describe, expect, it } from "vitest";
import type { WatchProvider } from "../types/tmdb";
import { getWatchProvidersForRegion } from "./watchProviders";

const provider = (
  provider_id: number,
  provider_name: string,
  display_priority = 10,
): WatchProvider => ({
  provider_id,
  provider_name,
  display_priority,
  logo_path: null,
});

describe("getWatchProvidersForRegion", () => {
  it("agrupa por modalidade e ordena pela prioridade do TMDB", () => {
    const result = getWatchProvidersForRegion({
      results: {
        BR: {
          link: "https://www.themoviedb.org/movie/123/watch",
          flatrate: [provider(8, "Netflix"), provider(119, "Amazon Prime Video", 1)],
          rent: [provider(2, "Apple TV")],
          buy: [provider(2, "Apple TV")],
        },
      },
    });

    expect(result.region).toBe("BR");
    expect(result.link).toContain("themoviedb.org");
    expect(result.groups.map(({ key }) => key)).toEqual(["flatrate", "rent", "buy"]);
    expect(result.groups[0]?.label).toBe("Assinatura");
    expect(result.groups[0]?.providers[0]?.provider_name).toBe("Amazon Prime Video");
  });

  it("retorna vazio quando a região não tem dados", () => {
    expect(getWatchProvidersForRegion({ results: {} }, "br")).toEqual({
      region: "BR",
      link: null,
      groups: [],
    });
    expect(getWatchProvidersForRegion(null)).toEqual({ region: "BR", link: null, groups: [] });
  });
});
