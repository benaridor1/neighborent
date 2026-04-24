"use client";

export type ProductReviewStatus = "pending" | "approved" | "rejected";

const PRODUCT_REVIEW_KEY = "rentup:admin-product-review-v1";
const PRODUCT_REVIEW_CHANGED_EVENT = "rentup:admin-product-review-changed";

export interface ProductReviewRecord {
  productId: string;
  status: ProductReviewStatus;
  reviewedAt: string;
}

export function productReviewChangedEventName(): string {
  return PRODUCT_REVIEW_CHANGED_EVENT;
}

export function listProductReviews(): ProductReviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRODUCT_REVIEW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        productId: String(item.productId ?? ""),
        status:
          item.status === "approved" || item.status === "rejected"
            ? item.status
            : "pending",
        reviewedAt: String(item.reviewedAt ?? ""),
      }))
      .filter((item) => item.productId.length > 0);
  } catch {
    return [];
  }
}

export function upsertProductReview(productId: string, status: ProductReviewStatus): void {
  if (typeof window === "undefined") return;
  const current = listProductReviews();
  const next: ProductReviewRecord = {
    productId,
    status,
    reviewedAt: new Date().toISOString(),
  };
  const merged = [...current.filter((item) => item.productId !== productId), next];
  window.localStorage.setItem(PRODUCT_REVIEW_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event(PRODUCT_REVIEW_CHANGED_EVENT));
}

export function productReviewStatusById(): Record<string, ProductReviewStatus> {
  return listProductReviews().reduce<Record<string, ProductReviewStatus>>((acc, row) => {
    acc[row.productId] = row.status;
    return acc;
  }, {});
}

