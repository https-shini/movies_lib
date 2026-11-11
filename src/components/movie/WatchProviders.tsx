import { PiArrowUpRight } from "react-icons/pi";
import { messages } from "../../i18n";
import { getLogoUrl } from "../../lib/images";
import { getWatchProvidersForRegion } from "../../lib/watchProviders";
import type { WatchProvidersResponse } from "../../types/tmdb";
import StateMessage from "../ui/StateMessage";
import "./WatchProviders.css";

const text = messages.providers;

interface WatchProvidersProps {
  providers: WatchProvidersResponse | undefined;
  region?: string | undefined;
}

/**
 * Onde assistir no Brasil. Os dados chegam junto com os detalhes do filme
 * (`append_to_response=watch/providers`), sem uma segunda requisição (D-41).
 */
const WatchProviders = ({ providers, region = "BR" }: WatchProvidersProps) => {
  const availability = getWatchProvidersForRegion(providers, region);

  if (!availability.groups.length) {
    return <StateMessage compact title={text.emptyTitle} message={text.emptyMessage} />;
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
        {text.note}
        {availability.link && (
          <>
            {" "}
            <a
              className="text-link"
              href={availability.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.tmdbLink} <PiArrowUpRight aria-hidden="true" />
            </a>
          </>
        )}
      </p>
      <p className="providers__note providers__credit">
        {messages.watchProvidersCredit.source}{" "}
        <a
          className="text-link"
          href="https://www.justwatch.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {messages.watchProvidersCredit.justWatch} <PiArrowUpRight aria-hidden="true" />
        </a>
      </p>
    </div>
  );
};

export default WatchProviders;
