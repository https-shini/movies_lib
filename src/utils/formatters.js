const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const RATING_FORMATTER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return "Não informado";
  return CURRENCY_FORMATTER.format(amount);
}

export function formatRuntime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "Não informada";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

export function formatRating(rating) {
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) return "N/A";
  return RATING_FORMATTER.format(rating);
}

export function formatReleaseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Não informada";
  }

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Não informada";

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export function getYouTubeTrailer(videos = []) {
  const youtubeTrailers = videos.filter(
    (video) => video.site === "YouTube" && video.type === "Trailer" && video.key,
  );

  const trailer = youtubeTrailers.find((video) => video.official) ?? youtubeTrailers[0];
  return trailer ? `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}` : null;
}
