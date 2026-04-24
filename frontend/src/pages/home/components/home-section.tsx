import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeCategory, LenderType } from "../types/home";
import { HomeCard } from "./home-card";
import { useLocale } from "../../../lib/locale-context";

interface HomeSectionProps {
  category: HomeCategory;
  lenderType: LenderType;
  /** When true, show every product in the category (e.g. favorites already filtered). */
  skipLenderFilter?: boolean;
  /** Home "all" pills: horizontal preview. Single category pill: full grid. */
  display?: "carousel" | "grid";
  onSeeAll?: () => void;
}

const PRIVATE_PREVIEW_LIMIT = 7;

export function HomeSection({ category, lenderType, skipLenderFilter, display = "carousel", onSeeAll }: HomeSectionProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const allMatching = skipLenderFilter ? category.products : category.products.filter((item) => item.lenderType === lenderType);

  const usePrivatePreviewStrip =
    display === "carousel" && !skipLenderFilter && lenderType === "private";

  const privateExtras = usePrivatePreviewStrip
    ? (() => {
        const privateOnly = category.products.filter((p) => p.lenderType === "private");
        const total = category.privateListingTotal ?? privateOnly.length;
        const shown = privateOnly.slice(0, PRIVATE_PREVIEW_LIMIT);
        const more = Math.max(0, total - shown.length);
        return { shown, more };
      })()
    : null;

  const products = privateExtras !== null ? privateExtras.shown : allMatching;

  const privateCategoryKey: Record<string, string> = {
    photo: "categoryPhoto",
    compute: "categoryComputingDrones",
    construction: "categoryConstruction",
    garden: "categoryGarden",
    sports: "categorySports",
    events: "categoryEvents",
  };
  const categoryTitle = `${t(privateCategoryKey[category.id] ?? "categoryPhoto")} · ${t("categoryPopularProducts")}`;
  if (products.length === 0) return null;

  const showMoreBadge = privateExtras !== null && privateExtras.more > 0;

  if (display === "grid") {
    return (
      <section className="space-y-4 border-t border-zinc-200 pt-5 first:border-0 first:pt-0" dir={isRtl ? "rtl" : "ltr"}>
        <h2 className="text-[26px] leading-none font-black text-zinc-900 sm:text-[33px]">{categoryTitle}</h2>
        <div className="grid grid-cols-1 justify-items-stretch gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <HomeCard key={product.id} product={product} layout="grid" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2 border-t border-zinc-200 pt-5 first:border-0 first:pt-0" dir={isRtl ? "rtl" : "ltr"}>
      <h2 className="text-[26px] leading-none font-black text-zinc-900 sm:text-[33px]">{categoryTitle}</h2>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex min-w-0 max-w-full flex-1 gap-2 overflow-x-auto pb-2">
          {products.map((product) => (
            <HomeCard key={product.id} product={product} />
          ))}
          {showMoreBadge ? (
            <span
              className="inline-flex shrink-0 items-center self-center rounded-full bg-emerald-950 px-3 py-1.5 text-sm font-black text-white shadow-sm tabular-nums"
              title={t("homeCategoryMoreListingsTitle")}
              aria-label={t("homeCategoryMoreListingsAria").replace("{count}", String(privateExtras.more))}
            >
              +{privateExtras.more}
            </span>
          ) : null}
        </div>
        {onSeeAll ? (
          <div className="flex shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={onSeeAll}
              className="inline-flex items-center gap-1 py-1 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
            >
              {t("seeAll")} {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function HomeSectionPage() {
  return null;
}
