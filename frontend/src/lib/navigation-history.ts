"use client";

const NAV_CURRENT_KEY = "rentup:nav-current";
const NAV_PREVIOUS_KEY = "rentup:nav-previous";

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function rememberNavigation(nextPath: string): void {
  if (typeof window === "undefined") return;
  const normalizedNext = normalizePath(nextPath);
  const current = window.sessionStorage.getItem(NAV_CURRENT_KEY);
  if (!current) {
    window.sessionStorage.setItem(NAV_CURRENT_KEY, normalizedNext);
    return;
  }
  if (current === normalizedNext) return;
  window.sessionStorage.setItem(NAV_PREVIOUS_KEY, current);
  window.sessionStorage.setItem(NAV_CURRENT_KEY, normalizedNext);
}

export function readPreviousPath(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(NAV_PREVIOUS_KEY);
}
