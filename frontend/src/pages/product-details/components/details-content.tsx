"use client";

import { useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import { ProductDetailsItem, ProductReviewEntry } from "../types/product-details";
import { useLocale } from "../../../lib/locale-context";

type DetailTab = "description" | "included" | "reviews" | "terms";

interface DetailsContentProps {
  product: ProductDetailsItem;
}

function parseIncludedList(product: ProductDetailsItem, t: (key: string) => string): string[] {
  if (product.whatsIncluded?.length) return product.whatsIncluded;
  return t("productDefaultWhatsIncluded")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildDemoReviews(product: ProductDetailsItem, t: (key: string) => string): ProductReviewEntry[] {
  if (product.reviewEntries?.length) return product.reviewEntries;
  return [
    { author: t("productReview1Author"), rating: 5, text: t("productReview1Body") },
    { author: t("productReview2Author"), rating: 5, text: t("productReview2Body") },
    { author: t("productReview3Author"), rating: 4, text: t("productReview3Body").replace("{name}", product.name) },
  ];
}

export function DetailsContent({ product }: DetailsContentProps) {
  const { language, t } = useLocale();
  const isRtlLayout = language === "he" || language === "ar";

  const [tab, setTab] = useState<DetailTab>("description");

  const included = useMemo(() => parseIncludedList(product, t), [product, language, t]);
  const reviews = useMemo(() => buildDemoReviews(product, t), [product, language, t]);
  const termsBody = product.rentalTerms ?? t("productRentalTermsBody");

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "description", label: t("description") },
    { id: "included", label: t("productTabWhatsIncluded") },
    { id: "reviews", label: t("productTabReviews") },
    { id: "terms", label: t("productTabTerms") },
  ];

  return (
    <section className={`space-y-6 ${isRtlLayout ? "text-right" : "text-left"}`} dir={isRtlLayout ? "rtl" : "ltr"}>
      <div className="rounded-xl border border-zinc-200 bg-white">
        <nav className="flex flex-wrap gap-1 border-b border-zinc-200 px-2 pt-2 sm:px-4" aria-label={t("productDetails")}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`relative min-h-[44px] shrink-0 px-3 pb-3 pt-2 text-sm font-medium transition sm:px-4 sm:text-base ${
                tab === id ? "font-semibold text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {label}
              <span
                className={`absolute inset-x-2 bottom-0 h-[3px] rounded-full ${tab === id ? "bg-zinc-900" : "bg-transparent"}`}
                aria-hidden
              />
            </button>
          ))}
        </nav>

        <div className="border-b border-zinc-100 px-4 py-5 sm:px-6 sm:py-6" role="tabpanel">
          {tab === "description" ? (
            <p className="text-sm leading-7 text-zinc-700">{product.description}</p>
          ) : null}

          {tab === "included" ? (
            <ul className={`flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-800 ${isRtlLayout ? "justify-end" : "justify-start"}`}>
              {included.map((line) => (
                <li key={line} className={`inline-flex max-w-full items-center gap-2 ${isRtlLayout ? "flex-row-reverse" : ""}`}>
                  <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.5} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {tab === "reviews" ? (
            <div className="space-y-5">
              {reviews.map((r, index) => (
                <article key={`${r.author}-${index}`} className="border-b border-zinc-100 pb-5 last:border-0 last:pb-0">
                  <div className={`mb-2 flex flex-wrap items-center gap-2 ${isRtlLayout ? "flex-row-reverse justify-end" : ""}`}>
                    <span className="font-semibold text-zinc-900">{r.author}</span>
                    <span className="inline-flex items-center gap-0.5 text-amber-600" aria-label={`${r.rating}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"} />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-700">{r.text}</p>
                </article>
              ))}
            </div>
          ) : null}

          {tab === "terms" ? <p className="text-sm leading-7 text-zinc-700">{termsBody}</p> : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-bold text-zinc-900">{t("productDetails")}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {product.specs.map((spec) => (
            <div key={spec.label} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
              <span className="font-semibold text-zinc-900">{spec.label}: </span>
              <span className="text-zinc-700">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DetailsContentPage() {
  return null;
}
