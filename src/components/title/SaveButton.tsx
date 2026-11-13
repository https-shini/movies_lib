import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import { useWatchlist } from "../../hooks/useWatchlist";
import { showToast } from "../../lib/toast";
import type { WatchlistItem } from "../../lib/watchlist";

const text = messages.watchlist;

/**
 * Salva ou remove o filme ou a série da "Minha lista". Um aviso confirma a ação; ao
 * remover, o aviso oferece "Desfazer", que devolve a lista exatamente como estava.
 */
const SaveButton = ({ item }: { item: Omit<WatchlistItem, "addedAt"> }) => {
  const { items, has, toggle, restore } = useWatchlist();
  const saved = has(item.mediaType, item.id);

  const onClick = () => {
    const previous = items;
    toggle(item);
    if (saved) {
      showToast(interpolate(text.removed, { title: item.title }), {
        action: {
          label: messages.toast.undo,
          onAction: () => {
            restore(previous);
          },
        },
      });
    } else {
      showToast(interpolate(text.added, { title: item.title }), { tone: "success" });
    }
  };

  return (
    <button
      type="button"
      className={`btn btn--ghost ${saved ? "btn--saved" : ""}`}
      aria-pressed={saved}
      onClick={onClick}
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
