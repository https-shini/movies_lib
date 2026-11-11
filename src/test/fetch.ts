/** URL de uma chamada ao fetch, qualquer que seja o tipo da entrada. */
export function urlOf(input: RequestInfo | URL | undefined): string {
  if (input === undefined) return "";
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}
