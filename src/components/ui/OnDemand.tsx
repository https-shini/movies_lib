import { useRef, type ReactNode } from "react";
import { useNearViewport } from "../../hooks/useNearViewport";

interface OnDemandProps {
  /** Mesma seção em estado de carregamento, com as mesmas dimensões do conteúdo final. */
  fallback: ReactNode;
  /** Conteúdo que busca seus dados; só é montado quando a seção chega perto da tela. */
  children: ReactNode;
}

/**
 * Adia a montagem (e, com ela, as consultas e as imagens) de uma seção abaixo da dobra
 * até que ela chegue perto da área visível.
 */
const OnDemand = ({ fallback, children }: OnDemandProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  // Em espera, os esqueletos ficam parados: animar fora da tela só gasta processamento.
  return (
    <div ref={ref} className={near ? undefined : "on-demand--idle"}>
      {near ? children : fallback}
    </div>
  );
};

export default OnDemand;
