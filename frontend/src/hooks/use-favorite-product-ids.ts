"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { FAVORITES_CHANGE_EVENT, readFavoriteProductIds, toggleFavoriteProductId } from "../lib/favorites-storage";

function snapshot(): string {
  if (typeof window === "undefined") return "[]";
  return JSON.stringify([...readFavoriteProductIds()].sort());
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(FAVORITES_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(FAVORITES_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useFavoriteProductIds() {
  const serialized = useSyncExternalStore(subscribe, snapshot, () => "[]");

  const ids = useMemo(() => {
    try {
      const arr = JSON.parse(serialized) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set<string>();
    }
  }, [serialized]);

  const toggle = useCallback((productId: string) => {
    toggleFavoriteProductId(productId);
  }, []);

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids]);

  return { favoriteIds: ids, isFavorite, toggleFavorite: toggle };
}
