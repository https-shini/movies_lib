import vercelConfig from "../vercel.json" with { type: "json" };

/**
 * Cabeçalhos de segurança aplicados a todas as respostas na Vercel (vercel.json).
 * O `vite preview` usa os mesmos valores, para os testes E2E rodarem sob a mesma CSP
 * da produção (D-39).
 */
export function securityHeaders(): Record<string, string> {
  const rule = vercelConfig.headers.find(({ source }) => source === "/(.*)");
  if (!rule) throw new Error('vercel.json: regra de cabeçalhos "/(.*)" não encontrada.');
  return Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
}
