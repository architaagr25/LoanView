const TOKEN_KEY = "loanview.token";

/**
 * Where the session token lives.
 *
 * localStorage rather than a cookie, because the frontend and the API are on
 * different domains. A cross-site cookie needs SameSite=None with Secure plus
 * credentialed CORS, and fails in ways that are tedious to diagnose. A token
 * sent in an Authorization header has none of those constraints.
 *
 * The trade-off, stated plainly: a token in localStorage is readable by any
 * JavaScript on the page, so a cross-site scripting flaw could steal it. A
 * cookie marked HttpOnly would not be. That is the safer option where the two
 * are on one domain, and worth revisiting if this were ever deployed that way.
 */
export function readToken(): string | null {
  // Guarded because this module is imported by code that also renders on the
  // server, where localStorage does not exist.
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
