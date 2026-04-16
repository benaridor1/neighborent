"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFavoriteProductIds } from "../../hooks/use-favorite-product-ids";
import { useLocale } from "../../lib/locale-context";
import { homeCategories } from "../home/data/home.mock";
import type { HomeCategory } from "../home/types/home";
import { HomeSection } from "../home/components/home-section";
import { DynamicBackLink } from "../../components/layout/dynamic-back-link";

export function FavoritesPage() {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const { favoriteIds } = useFavoriteProductIds();

  const categoriesWithFavorites: HomeCategory[] = useMemo(() => {
    return homeCategories
      .map((category) => ({
        ...category,
        products: category.products.filter((p) => favoriteIds.has(p.id)),
      }))
      .filter((category) => category.products.length > 0);
  }, [favoriteIds]);

  const hasAny = categoriesWithFavorites.length > 0;

  return (
    <main className="bg-white">
      <div className="flex w-full flex-col gap-5 px-4 py-6 md:px-8 lg:px-10">
        <div className={`flex flex-col gap-2 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          <DynamicBackLink className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`} />
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">{t("menuFavorites")}</h1>
          <p className="max-w-2xl text-sm text-zinc-600">{t("favoritesIntro")}</p>
        </div>

        {!hasAny ? (
          <p className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-5 py-12 text-center text-sm text-zinc-600" dir={isRtl ? "rtl" : "ltr"}>
            {t("favoritesEmpty")}
          </p>
        ) : (
          <div className="space-y-5">
            {categoriesWithFavorites.map((category) => (
              <HomeSection key={category.id} category={category} lenderType="private" skipLenderFilter />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function FavoritesTemplatePage() {
  return null;
}
