import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { messages } from "../../i18n";
import { useWatchlist } from "../../hooks/useWatchlist";
import type { WatchlistItem } from "../../lib/watchlist";

const text = messages.watchlist;

/** Salva ou remove o filme ou a série da "Minha lista". */
const SaveButton = ({ item }: { item: Omit<WatchlistItem, "addedAt"> }) => {
  const { has, toggle } = useWatchlist();
  const saved = has(item.mediaType, item.id);

  return (
    <button
      type="button"
      className={`btn btn--ghost ${saved ? "btn--saved" : ""}`}
      aria-pressed={saved}
      onClick={() => {
        toggle(item);
      }}
    >
      {saved ? (
        <PiBookmarkSimpleFill aria-hidden="true" />
      ) : (
        <PiBookmarkSimple aria-hidden="true" />
      )}
      {saved ? text.saved : text.save}
    </button>
  );
};

export default SaveButton;
