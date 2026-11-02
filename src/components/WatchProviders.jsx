import { useCallback } from "react";
import { BsArrowUpRight, BsPlayCircle } from "react-icons/bs";
import { useAsyncData } from "../hooks/useAsyncData";
import {
  fetchMovieWatchProviders,
  getProviderLogoUrl,
  getWatchProvidersForRegion,
} from "../services/watchProviders";
import AsyncState from "./AsyncState";
import "./WatchProviders.css";

const WatchProviders = ({ movieId, region = "BR" }) => {
  const loadProviders = useCallback(
    (signal) => fetchMovieWatchProviders(movieId, { signal }),
    [movieId],
  );
  const { data, isLoading, error } = useAsyncData(loadProviders);
  const availability = getWatchProvidersForRegion(data, region);
  const hasProviders = availability.groups.length > 0;

  return (
    <section className="watch-providers" aria-labelledby="watch-providers-title">
      <div className="watch-providers__heading">
        <div>
          <p className="watch-providers__eyebrow">Onde assistir</p>
          <h2 id="watch-providers-title">Disponibilidade no Brasil</h2>
        </div>
        <span className="watch-providers__region" aria-label="Região Brasil">BR</span>
      </div>

      {isLoading || error ? (
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={false}
        />
      ) : !hasProviders ? (
        <p className="watch-providers__empty">
          Nenhuma opção de streaming foi informada para este filme no Brasil.
        </p>
      ) : (
        <>
          <div className="watch-providers__groups">
            {availability.groups.map((group) => (
              <div className="watch-providers__group" key={group.key}>
                <h3>{group.label}</h3>
                <div className="watch-providers__list">
                  {group.providers.map((provider) => {
                    const logo = getProviderLogoUrl(provider.logo_path);
                    return (
                      <div className="watch-provider" key={provider.provider_id}>
                        {logo ? (
                          <img src={logo} alt="" loading="lazy" />
                        ) : (
                          <span className="watch-provider__fallback" aria-hidden="true">
                            {provider.provider_name.slice(0, 1)}
                          </span>
                        )}
                        <span>{provider.provider_name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {availability.link && (
            <a
              className="watch-providers__source"
              href={availability.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar opções e condições no TMDB
              <BsArrowUpRight aria-hidden="true" />
            </a>
          )}
        </>
      )}

      <p className="watch-providers__disclaimer">
        A disponibilidade pode mudar conforme a região e o catálogo de cada serviço.
        Confirme preços, planos e condições diretamente na plataforma.
      </p>
      <span className="watch-providers__attribution">
        <BsPlayCircle aria-hidden="true" /> Dados de disponibilidade fornecidos pelo TMDB
      </span>
    </section>
  );
};

export default WatchProviders;
