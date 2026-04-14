const AUTH_STORAGE_KEY = "rentup:is-authenticated";
const AUTH_CHANGE_EVENT = "rentup-auth-changed";

export function markUserAuthenticated(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthentication(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getAuthChangeEventName(): string {
  return AUTH_CHANGE_EVENT;
}
