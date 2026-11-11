/**
 * Exibido só no primeiro carregamento de uma página dividida (React Router
 * HydrateFallback), enquanto o código dela chega. Ocupa a tela para não haver
 * salto de layout quando o conteúdo aparece.
 */
const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-busy="true">
    <span className="sr-only">Carregando…</span>
  </div>
);

export default RouteFallback;
