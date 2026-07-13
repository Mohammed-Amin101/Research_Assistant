const TOKEN_KEY = "research_assistant_token";

// This app runs under TanStack Start (SSR), so every localStorage access
// must be guarded — `window` doesn't exist on the server.
const canUseStorage = () => typeof window !== "undefined";

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}
