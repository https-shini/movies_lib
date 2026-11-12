import { afterEach, describe, expect, it, vi } from "vitest";
import { urlOf } from "../test/fetch";
import { loadPerson } from "./usePerson";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const person = { id: 287, name: "Brad Pitt", profile_path: null };

function mockByLanguage(responses: Record<string, () => Response>) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const language = new URL(urlOf(input), "http://localhost").searchParams.get("language") ?? "";
    const respond = responses[language];
    return Promise.resolve(respond ? respond() : json({}, 500));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("loadPerson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("usa a biografia em português sem uma segunda consulta", async () => {
    const fetchMock = mockByLanguage({ "pt-BR": () => json({ ...person, biography: "Ator." }) });
    const profile = await loadPerson(287, new AbortController().signal);

    expect(profile).toMatchObject({ biography: "Ator.", biographyInEnglish: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("busca a biografia em inglês quando falta a tradução e avisa", async () => {
    mockByLanguage({
      "pt-BR": () => json({ ...person, biography: "" }),
      "en-US": () => json({ ...person, biography: "An actor." }),
    });
    const profile = await loadPerson(287, new AbortController().signal);

    expect(profile).toMatchObject({ biography: "An actor.", biographyInEnglish: true });
  });

  it("mostra o perfil sem biografia se a consulta em inglês falhar", async () => {
    mockByLanguage({
      "pt-BR": () => json({ ...person, biography: "" }),
      "en-US": () => json({}, 503),
    });
    const profile = await loadPerson(287, new AbortController().signal);

    expect(profile).toMatchObject({ name: "Brad Pitt", biography: "", biographyInEnglish: false });
  });
});
