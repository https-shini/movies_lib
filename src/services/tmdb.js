const API_BASE_URL = import.meta.env.VITE_API;
const API_KEY_CONFIG = import.meta.env.VITE_API_KEY;

function appendApiKey(url) {
  if (!API_KEY_CONFIG) {
    throw new Error("A chave da API do TMDB não foi configurada. Defina VITE_API_KEY no arquivo .env.");
  }

  const normalizedKey = API_KEY_CONFIG.replace(/^[?&]/, "");
  const keyParams = new URLSearchParams(normalizedKey);

  for (const [key, value] of keyParams.entries()) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }
}

export async function fetchTmdb(endpoint, { params = {}, signal } = {}) {
  if (!endpoint) {
    throw new Error("O endpoint da API do TMDB não foi configurado.");
  }

  let url;

  try {
    url = new URL(endpoint, API_BASE_URL);
  } catch {
    throw new Error("A URL da API do TMDB é inválida. Verifique as variáveis de ambiente.");
  }

  appendApiKey(url);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, { signal });

  if (!response.ok) {
    let message = `Não foi possível consultar o TMDB (HTTP ${response.status}).`;

    try {
      const errorData = await response.json();
      if (errorData.status_message) message = errorData.status_message;
    } catch {
      // Mantém a mensagem HTTP quando a resposta não contém JSON.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (data.success === false) {
    throw new Error(data.status_message || "O TMDB não conseguiu concluir a solicitação.");
  }

  return data;
}

export function getPosterUrl(path) {
  const imageBaseUrl = import.meta.env.VITE_IMG;

  if (!path || !imageBaseUrl) return null;

  return `${imageBaseUrl.replace(/\/$/, "")}/${size}/${path.replace(/^\//, "")}`;
}
