import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoriteProductIds } from "../../../hooks/use-favorite-product-ids";
import { HomeProduct } from "../types/home";
import { useLocale } from "../../../lib/locale-context";

interface HomeCardProps {
  product: HomeProduct;
  /** Grid layout stretches cards for category browse; default matches home carousel. */
  layout?: "carousel" | "grid";
}

export function HomeCard({ product, layout = "carousel" }: HomeCardProps) {
  const { formatCurrency, language, t } = useLocale();
  const { isFavorite, toggleFavorite } = useFavoriteProductIds();
  const isRtl = language === "he" || language === "ar";
  const locationLabel = isRtl ? product.city : t("locationIsrael");
  const liked = isFavorite(product.id);

  return (
    <article
      className={`relative overflow-hidden rounded-xl border border-zinc-100 bg-white ${
        layout === "grid" ? "mx-auto w-full max-w-[315px]" : "w-[188px] shrink-0"
      }`}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-[132px] bg-zinc-100">
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
          <span className="absolute end-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] text-zinc-700">{t("favorite")}</span>
        </div>
        <div className={`space-y-0.5 p-2 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          <h3 className="truncate text-[11px] font-semibold text-zinc-900">{product.name}</h3>
          <p className="text-[10px] text-zinc-600">
            {locationLabel} · {product.rating.toFixed(1)} ⭐
          </p>
          <p className="text-[11px] font-semibold text-zinc-900">
            {formatCurrency(product.pricePerDay)} <span className="text-zinc-500">{t("perDay")}</span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-pressed={liked}
        aria-label={liked ? t("favoritesRemove") : t("favoritesAdd")}
        title={liked ? t("favoritesRemove") : t("favoritesAdd")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className={`absolute start-2 top-2 z-10 rounded-full border border-zinc-200 bg-white p-1.5 text-zinc-700 transition hover:border-emerald-900/30 ${
          liked ? "border-emerald-900/40 bg-emerald-50 text-emerald-950" : ""
        }`}
      >
        <Heart size={12} className={liked ? "fill-current" : ""} strokeWidth={2} />
      </button>
    </article>
  );
}

export default function HomeCardPage() {
  return null;
}
