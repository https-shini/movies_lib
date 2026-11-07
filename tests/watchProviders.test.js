import { describe, expect, it } from "vitest";

import { getProviderLogoUrl, getWatchProvidersForRegion } from "../src/services/watchProviders.js";

const provider = (provider_id, provider_name, display_priority = 10) => ({
  provider_id,
  provider_name,
  display_priority,
});

describe("getWatchProvidersForRegion", () => {
  it("groups Brazilian providers by subscription, rent and buy", () => {
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
    expect(result.groups[0].providers[0].provider_name).toBe("Amazon Prime Video");
  });

  it("returns an empty result when the requested region is unavailable", () => {
    expect(getWatchProvidersForRegion({ results: {} }, "BR")).toEqual({
      region: "BR",
      link: null,
      groups: [],
    });
  });

  it("ignores malformed providers and handles missing provider groups", () => {
    const result = getWatchProvidersForRegion({
      results: { BR: { flatrate: [provider(8, "Netflix"), { provider_name: "Invalid" }] } },
    });

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].providers).toHaveLength(1);
  });

  it("normalizes the region code", () => {
    const result = getWatchProvidersForRegion(
      { results: { br: { free: [provider(1, "Free")] } } },
      "br",
    );
    expect(result.region).toBe("BR");
  });
});

describe("getProviderLogoUrl", () => {
  it("returns a TMDB image URL for a provider logo", () => {
    expect(getProviderLogoUrl("/logo.png")).toBe("https://image.tmdb.org/t/p/w92/logo.png");
  });

  it("returns null when the provider has no logo", () => {
    expect(getProviderLogoUrl(null)).toBeNull();
  });
});
