const TOKEN_STORAGE_KEY = "neenjas.auth.token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthorizationHeaders() {
  const token = getStoredAccessToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const authorizationHeaders = getAuthorizationHeaders();
  for (const [key, value] of Object.entries(authorizationHeaders)) {
    headers.set(key, value);
  }

  const requestUrl = `${API_BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...init,
      headers,
    });
  } catch (error) {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown origin";
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new Error(`Unable to reach API at ${requestUrl} from ${currentOrigin}. ${message}`);
  }

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      const message = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
      throw new Error(message || `Request failed with ${response.status}`);
    } catch {
      throw new Error(text || `Request failed with ${response.status}`);
    }
  }

  return (await response.json()) as T;
}
