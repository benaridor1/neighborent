"use client";

import Link from "next/link";
import { FavoriteToggleButton } from "../../components/favorite-toggle-button";
import { getProductDetails } from "./data/product-details.mock";
import { BookingPanel } from "./components/booking-panel";
import { DetailsContent } from "./components/details-content";
import { DetailsHeader } from "./components/details-header";
import { ImageGallery } from "./components/image-gallery";
import { SimilarItem } from "./components/similar-item";
import { useLocale } from "../../lib/locale-context";

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const product = getProductDetails(productId, language);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50" key={product.id}>
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3" dir={isRtl ? "rtl" : "ltr"}>
          <Link
            href={product.rentalCompanyId ? `/rental-companies/${product.rentalCompanyId}` : "/"}
            className="text-sm font-medium text-zinc-700"
          >
            {product.rentalCompanyId ? t("backToRentalCatalog") : t("backToHome")}
          </Link>
          <FavoriteToggleButton productId={product.id} variant="large" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <DetailsHeader product={product} />
            <ImageGallery product={product} />
            <DetailsContent product={product} />
            <SimilarItem product={product} />
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <BookingPanel product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailsTemplatePage() {
  return null;
}
