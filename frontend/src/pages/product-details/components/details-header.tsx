import { ProductDetailsItem } from "../types/product-details";
import { useLocale } from "../../../lib/locale-context";

interface DetailsHeaderProps {
  product: ProductDetailsItem;
}

export function DetailsHeader({ product }: DetailsHeaderProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  return (
    <header className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-black text-zinc-900">{product.name}</h1>
      <p className="text-sm text-zinc-600">
        {product.city} · {product.rating.toFixed(1)} ⭐ · {product.reviewsCount} {t("reviews")}
      </p>
    </header>
  );
}

export default function DetailsHeaderPage() {
  return null;
}
