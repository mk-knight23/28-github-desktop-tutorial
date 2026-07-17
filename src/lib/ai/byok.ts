/**
 * Bring-your-own-key storage (STANDARDS §10, PRODUCT_SPEC §6).
 *
 * The single documented BYOK mechanism for MK GitFlow: the user's AI gateway key
 * is held ONLY in this browser (localStorage) and sent per request in the
 * `x-byok-key` header to our own route, which forwards it to the gateway without
 * storing or logging it. It is never placed in a request body, a URL, or an
 * analytics event.
 */

const BYOK_STORAGE_KEY = "mk-gitflow:byok-key";

export function getByokKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(BYOK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setByokKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = key.trim();
    if (trimmed) window.localStorage.setItem(BYOK_STORAGE_KEY, trimmed);
    else window.localStorage.removeItem(BYOK_STORAGE_KEY);
  } catch {
    // private mode — key lives only for this page view
  }
}

export function clearByokKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BYOK_STORAGE_KEY);
  } catch {
    // nothing to do
  }
}

export function hasByokKey(): boolean {
  return getByokKey().length > 0;
}
