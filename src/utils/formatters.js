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
