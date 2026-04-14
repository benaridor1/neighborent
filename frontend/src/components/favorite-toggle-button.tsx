"use client";

import { Heart } from "lucide-react";
import { useFavoriteProductIds } from "../hooks/use-favorite-product-ids";
import { useLocale } from "../lib/locale-context";

interface FavoriteToggleButtonProps {
  productId: string;
  variant?: "default" | "large";
}

export function FavoriteToggleButton({ productId, variant = "default" }: FavoriteToggleButtonProps) {
  const { t } = useLocale();
  const { isFavorite, toggleFavorite } = useFavoriteProductIds();
  const active = isFavorite(productId);
  const large = variant === "large";

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(productId)}
      aria-pressed={active}
      aria-label={active ? t("favoritesRemove") : t("favoritesAdd")}
      title={active ? t("favoritesRemove") : t("favoritesAdd")}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${
        large
          ? "border-zinc-200 bg-white p-3 text-zinc-700 hover:border-emerald-900/30 hover:bg-zinc-50"
          : "border-zinc-200 bg-white p-1.5 text-zinc-700 hover:border-emerald-900/30"
      } ${active ? "border-emerald-900/40 bg-emerald-50 text-emerald-950" : ""}`}
    >
      <Heart size={large ? 22 : 14} className={active ? "fill-current" : ""} strokeWidth={2} />
    </button>
  );
}
