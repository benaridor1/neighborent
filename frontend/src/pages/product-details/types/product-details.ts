export interface ProductReviewEntry {
  author: string;
  rating: number;
  text: string;
}

export interface ProductDetailsItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewsCount: number;
  pricePerDay: number;
  images: string[];
  description: string;
  specs: Array<{ label: string; value: string }>;
  /** Rental catalog item: enables company cart + quantity on the booking panel. */
  rentalCompanyId?: string;
  /** Override default “what’s included” bullets (pipe-separated defaults otherwise). */
  whatsIncluded?: string[];
  /** Override demo reviews for this product page. */
  reviewEntries?: ProductReviewEntry[];
  /** Override rental terms body (locale default otherwise). */
  rentalTerms?: string;
}

export default function ProductDetailsTypesPage() {
  return null;
}
