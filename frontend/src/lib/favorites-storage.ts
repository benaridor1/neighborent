const FAVORITES_STORAGE_KEY = "rentup:favorite-product-ids";
export const FAVORITES_CHANGE_EVENT = "rentup-favorites-changed";

export function readFavoriteProductIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0));
  } catch {
    return new Set();
  }
}

function writeFavoriteProductIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
}

/** @returns true if now favorite, false if removed */
export function toggleFavoriteProductId(productId: string): boolean {
  const next = readFavoriteProductIds();
  if (next.has(productId)) {
    next.delete(productId);
    writeFavoriteProductIds(next);
    return false;
  }
  next.add(productId);
  writeFavoriteProductIds(next);
  return true;
}

export function isFavoriteProductId(productId: string): boolean {
  return readFavoriteProductIds().has(productId);
}
