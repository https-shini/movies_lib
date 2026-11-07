import { PiArrowUpRight } from "react-icons/pi";
import { useWatchProviders } from "../../hooks/useWatchProviders";
import { getLogoUrl } from "../../lib/images";
import { getWatchProvidersForRegion } from "../../lib/watchProviders";
import StateMessage from "../ui/StateMessage";
import "./WatchProviders.css";

const ProviderSkeleton = () => (
  <div className="providers__groups" aria-hidden="true">
    {[0, 1].map((group) => (
      <div key={group} className="providers__group">
        <span className="skeleton skeleton--text" style={{ width: "6rem" }} />
        <div className="providers__list">
          {[0, 1, 2].map((item) => (
            <span key={item} className="skeleton providers__logo" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const WatchProviders = ({ movieId, region = "BR" }) => {
  const { data, isLoading, error, reload } = useWatchProviders(movieId);
  const availability = getWatchProvidersForRegion(data, region);

  if (isLoading) return <ProviderSkeleton />;

  if (error) {
    return (
      <StateMessage
        tone="error"
        compact
        title="Não foi possível consultar onde assistir"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!availability.groups.length) {
    return (
      <StateMessage
        compact
        title="Sem opções informadas no Brasil"
        message="O TMDB não lista serviços de streaming, aluguel ou compra para este filme na região."
      />
    );
  }

  return (
    <div className="providers">
      <div className="providers__groups">
        {availability.groups.map((group) => (
          <div className="providers__group" key={group.key}>
            <h3 className="providers__label mono">{group.label}</h3>
            <ul className="providers__list" role="list">
              {group.providers.map((provider) => {
                const logo = getLogoUrl(provider.logo_path);
                return (
                  <li
                    key={provider.provider_id}
                    className="provider"
                    title={provider.provider_name}
                  >
                    {logo ? (
                      <img className="providers__logo" src={logo} alt="" loading="lazy" />
                    ) : (
                      <span
                        className="providers__logo providers__logo--fallback"
                        aria-hidden="true"
                      >
                        {provider.provider_name.slice(0, 1)}
                      </span>
                    )}
                    <span className="provider__name">{provider.provider_name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="providers__note">
        A disponibilidade muda com frequência. Confirme preços e planos na plataforma.
        {availability.link && (
          <>
            {" "}
            <a
              className="text-link"
              href={availability.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no TMDB <PiArrowUpRight aria-hidden="true" />
            </a>
          </>
        )}
      </p>
    </div>
  );
};

export default WatchProviders;
