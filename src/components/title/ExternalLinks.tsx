import type { IconType } from "react-icons";
import {
  PiArrowUpRight,
  PiFacebookLogo,
  PiFilmReel,
  PiGlobe,
  PiInstagramLogo,
  PiTiktokLogo,
  PiXLogo,
  PiYoutubeLogo,
} from "react-icons/pi";
import { messages } from "../../i18n";
import type { ExternalIds } from "../../types/tmdb";
import "./ExternalLinks.css";

const text = messages.title;

interface ExternalLink {
  label: string;
  href: string;
  Icon: IconType;
}

/** Identificadores com caracteres fora do esperado são descartados, não viram link. */
const SAFE_ID = /^[\w.-]{1,80}$/;
const safe = (value: string | null | undefined) => (value && SAFE_ID.test(value) ? value : null);

/** Links oficiais a partir dos identificadores do TMDB; só os que existem aparecem. */
export function buildExternalLinks(
  ids: ExternalIds | null | undefined,
  options: { homepage?: string | null | undefined; imdb: "title" | "name" },
): ExternalLink[] {
  const links: ExternalLink[] = [];
  const add = (label: string, href: string | null, Icon: IconType) => {
    if (href) links.push({ label, href, Icon });
  };
  const id = (key: keyof ExternalIds) => safe(ids?.[key]);
  const homepage = options.homepage?.trim() ?? "";

  add(text.homepage, /^https?:\/\//.test(homepage) ? homepage : null, PiGlobe);
  const imdb = id("imdb_id");
  add("IMDb", imdb && `https://www.imdb.com/${options.imdb}/${imdb}/`, PiFilmReel);
  const instagram = id("instagram_id");
  add("Instagram", instagram && `https://www.instagram.com/${instagram}/`, PiInstagramLogo);
  const twitter = id("twitter_id");
  add("X", twitter && `https://x.com/${twitter}`, PiXLogo);
  const facebook = id("facebook_id");
  add("Facebook", facebook && `https://www.facebook.com/${facebook}`, PiFacebookLogo);
  const tiktok = id("tiktok_id");
  add("TikTok", tiktok && `https://www.tiktok.com/@${tiktok}`, PiTiktokLogo);
  const youtube = id("youtube_id");
  add("YouTube", youtube && `https://www.youtube.com/${youtube}`, PiYoutubeLogo);

  return links;
}

interface ExternalLinksProps {
  ids: ExternalIds | null | undefined;
  homepage?: string | null | undefined;
  imdb: "title" | "name";
}

const ExternalLinks = ({ ids, homepage, imdb }: ExternalLinksProps) => {
  const links = buildExternalLinks(ids, { homepage, imdb });
  if (!links.length) return null;

  return (
    <ul className="external-links" role="list" aria-label={text.linksTitle}>
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a className="chip" href={href} target="_blank" rel="noopener noreferrer">
            <Icon aria-hidden="true" />
            {label}
            <PiArrowUpRight aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
};

export default ExternalLinks;
