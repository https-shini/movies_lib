import { describe, expect, it } from "vitest";
import { redactEvent, redactUrl, toAnalyticsRoute } from "./analytics";

describe("toAnalyticsRoute", () => {
  it("agrupa a página de filme numa única rota", () => {
    expect(toAnalyticsRoute("/movie/550")).toBe("/movie/[id]");
    expect(toAnalyticsRoute("/movie/603/")).toBe("/movie/[id]");
  });

  it("mantém as demais rotas", () => {
    expect(toAnalyticsRoute("/")).toBe("/");
    expect(toAnalyticsRoute("/discover")).toBe("/discover");
    expect(toAnalyticsRoute("/sobre")).toBe("/sobre");
  });
});

describe("redactUrl", () => {
  it("remove o termo de busca e mantém os demais parâmetros", () => {
    expect(redactUrl("https://cinelux.app/search?q=Velozes%20%26%20Furiosos&page=2")).toBe(
      "https://cinelux.app/search?page=2",
    );
    expect(redactUrl("https://cinelux.app/discover?genre=18")).toBe(
      "https://cinelux.app/discover?genre=18",
    );
  });

  it("não quebra com URL inválida", () => {
    expect(redactUrl("não é url")).toBe("não é url");
  });

  it("preserva os outros campos do evento", () => {
    expect(redactEvent({ url: "https://cinelux.app/search?q=duna", type: "pageview" })).toEqual({
      url: "https://cinelux.app/search",
      type: "pageview",
    });
  });
});
