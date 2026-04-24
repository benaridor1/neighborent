import { ChevronLeft, ChevronRight } from "lucide-react";
import { RentalCompanyCategory } from "../types/home";
import { RentalCompanyCard } from "./rental-company-card";
import { useLocale } from "../../../lib/locale-context";

interface RentalCompanySectionProps {
  category: RentalCompanyCategory;
  display?: "carousel" | "grid";
  onSeeAll?: () => void;
}

export function RentalCompanySection({ category, display = "carousel", onSeeAll }: RentalCompanySectionProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const rentalBlockKey: Record<string, string> = {
    "camera-companies": "categoryPhoto",
    "tech-companies": "categoryComputingDrones",
    "construction-companies": "categoryConstruction",
    "garden-companies": "categoryGarden",
    "sports-companies": "categorySports",
    "events-companies": "categoryEvents",
  };
  const categoryTitle = `${t(rentalBlockKey[category.id] ?? "categoryPhoto")} · ${t("categoryRentalCompanies")}`;
  if (category.companies.length === 0) return null;

  if (display === "grid") {
    return (
      <section className="space-y-4 border-t border-zinc-200 pt-5 first:border-0 first:pt-0" dir={isRtl ? "rtl" : "ltr"}>
        <h2 className="text-[26px] leading-none font-black text-zinc-900 sm:text-[33px]">{categoryTitle}</h2>
        <div className="grid grid-cols-1 justify-items-stretch gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {category.companies.map((company) => (
            <RentalCompanyCard key={company.id} company={company} layout="grid" />
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
          {category.companies.map((company) => (
            <RentalCompanyCard key={company.id} company={company} />
          ))}
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

export default function RentalCompanySectionPage() {
  return null;
}
