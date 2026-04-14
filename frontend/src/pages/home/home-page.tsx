"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { homeCategories, rentalCompanyCategories } from "./data/home.mock";
import { HomeProduct, LenderType, RentalCompany } from "./types/home";
import { HomeSection } from "./components/home-section";
import { HomeSearch } from "./components/home-search";
import { LenderToggle } from "./components/lender-toggle";
import { HomeCard } from "./components/home-card";
import { RentalCompanyCard } from "./components/rental-company-card";
import { RentalCompanySection } from "./components/rental-company-section";
import { useLocale } from "../../lib/locale-context";

interface SearchState {
  city: string;
  searchText: string;
  category: string;
  filters: {
    minPrice: number;
    maxPrice: number;
    equipmentCondition: string;
    lenderRating: string;
  };
}

const extractCategoryLabel = (title: string) => title.split("·")[0].trim();

/** Search panel category id → rental block id (private `photo` → `camera-companies`). */
const searchCategoryToRentalBlockId: Record<string, string | null> = {
  photo: "camera-companies",
  compute: "tech-companies",
  construction: "construction-companies",
  garden: "garden-companies",
  sports: "sports-companies",
  events: "events-companies",
};

const categoryTranslationKeyById: Record<string, string> = {
  photo: "categoryPhoto",
  compute: "categoryComputingDrones",
  construction: "categoryConstruction",
  garden: "categoryGarden",
  sports: "categorySports",
  events: "categoryEvents",
  tools: "categoryTools",
  camera: "categoryPhoto",
  tech: "categoryComputingDrones",
};

const rentalCompanyBlockTitleKey: Record<string, string> = {
  "camera-companies": "categoryPhoto",
  "tech-companies": "categoryComputingDrones",
  "construction-companies": "categoryConstruction",
  "garden-companies": "categoryGarden",
  "sports-companies": "categorySports",
  "events-companies": "categoryEvents",
};

type CategoryBrowse = { mode: "private"; categoryId: string } | { mode: "company"; blockId: string };

export function HomePage() {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [lenderType, setLenderType] = useState<LenderType>("private");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [categoryBrowse, setCategoryBrowse] = useState<CategoryBrowse | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(t("all"));
  const getCategoryLabel = (categoryId: string, fallbackTitle: string) => t(categoryTranslationKeyById[categoryId] ?? extractCategoryLabel(fallbackTitle));

  const flatProducts = homeCategories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryTitle: category.title,
    })),
  );

  const filteredProducts: HomeProduct[] = searchState
    ? flatProducts.filter((product) => {
        if (product.lenderType !== lenderType) return false;
        if (product.pricePerDay < searchState.filters.minPrice || product.pricePerDay > searchState.filters.maxPrice) return false;
        if (product.rating < (searchState.filters.lenderRating === "4.8+" ? 4.8 : searchState.filters.lenderRating === "4.5+" ? 4.5 : searchState.filters.lenderRating === "4.0+" ? 4.0 : 0)) {
          return false;
        }
        if (searchState.searchText.trim() && !product.name.toLowerCase().includes(searchState.searchText.toLowerCase())) return false;
        if (searchState.category !== "all") {
          const categoryMatch = homeCategories.find((category) => category.products.some((item) => item.id === product.id));
          if (!categoryMatch || categoryMatch.id !== searchState.category) return false;
        }
        return true;
      })
    : [];

  const flatCompanies = rentalCompanyCategories.flatMap((category) =>
    category.companies.map((company) => ({
      ...company,
      categoryTitle: category.title,
    })),
  );

  const filteredCompanies: RentalCompany[] = searchState
    ? flatCompanies.filter((company) => {
        if (company.rating < (searchState.filters.lenderRating === "4.8+" ? 4.8 : searchState.filters.lenderRating === "4.5+" ? 4.5 : searchState.filters.lenderRating === "4.0+" ? 4.0 : 0)) {
          return false;
        }
        if (searchState.category !== "all") {
          const expectedBlockId = searchCategoryToRentalBlockId[searchState.category];
          if (expectedBlockId === null) return false;
          const categoryMatch = rentalCompanyCategories.find((category) => category.companies.some((item) => item.id === company.id));
          if (!categoryMatch || categoryMatch.id !== expectedBlockId) return false;
        }
        return true;
      })
    : [];

  const privateSubcategories = [t("all"), ...homeCategories.map((category) => getCategoryLabel(category.id, category.title))];
  const companySubcategories = [t("all"), ...rentalCompanyCategories.map((category) => getCategoryLabel(category.id.replace("-companies", ""), category.title))];
  const activeSubcategories = lenderType === "private" ? privateSubcategories : companySubcategories;

  useEffect(() => {
    setSelectedSubcategory(t("all"));
  }, [language, t]);

  useEffect(() => {
    if (categoryBrowse) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [categoryBrowse]);

  const browsePrivateCategory =
    categoryBrowse?.mode === "private" ? homeCategories.find((c) => c.id === categoryBrowse.categoryId) : undefined;
  const browseCompanyBlock =
    categoryBrowse?.mode === "company" ? rentalCompanyCategories.find((c) => c.id === categoryBrowse.blockId) : undefined;

  const browsePrivateProducts =
    browsePrivateCategory?.products.filter((product) => product.lenderType === lenderType) ?? [];
  const browseCompanyList = browseCompanyBlock?.companies ?? [];

  const browseSectionTitle =
    categoryBrowse?.mode === "private" && browsePrivateCategory
      ? `${t(categoryTranslationKeyById[browsePrivateCategory.id] ?? "categoryPhoto")} · ${t("categoryPopularProducts")}`
      : categoryBrowse?.mode === "company" && browseCompanyBlock
        ? `${t(rentalCompanyBlockTitleKey[browseCompanyBlock.id] ?? "categoryPhoto")} · ${t("categoryRentalCompanies")}`
        : "";

  const homeSectionDisplay = selectedSubcategory === t("all") ? "carousel" : "grid";
  const showHomeSeeAll = selectedSubcategory === t("all");

  const privateCategoriesToRender = selectedSubcategory === t("all")
    ? homeCategories
    : homeCategories.filter((category) => getCategoryLabel(category.id, category.title) === selectedSubcategory);

  const companyCategoriesToRender = selectedSubcategory === t("all")
    ? rentalCompanyCategories
    : rentalCompanyCategories.filter((category) => getCategoryLabel(category.id.replace("-companies", ""), category.title) === selectedSubcategory);

  const searchProductsToRender = selectedSubcategory === t("all")
    ? filteredProducts
    : filteredProducts.filter((product) => {
        const categoryMatch = homeCategories.find((category) => category.products.some((item) => item.id === product.id));
        return categoryMatch ? getCategoryLabel(categoryMatch.id, categoryMatch.title) === selectedSubcategory : false;
      });

  const searchCompaniesToRender = selectedSubcategory === t("all")
    ? filteredCompanies
    : filteredCompanies.filter((company) => {
        const categoryMatch = rentalCompanyCategories.find((category) => category.companies.some((item) => item.id === company.id));
        return categoryMatch ? getCategoryLabel(categoryMatch.id.replace("-companies", ""), categoryMatch.title) === selectedSubcategory : false;
      });

  return (
    <main className="bg-white">
      <div className="flex w-full flex-col gap-5 px-4 py-3 md:px-8 lg:px-10">
        <HomeSearch
          onSearch={(payload) => {
            setCategoryBrowse(null);
            setSearchState({
              city: payload.city,
              searchText: payload.searchText,
              category: payload.category,
              filters: payload.filters,
            });
          }}
        />
        <LenderToggle
          providerType={lenderType}
          onProviderChange={(nextType) => {
            setLenderType(nextType);
            setSelectedSubcategory(t("all"));
            setCategoryBrowse(null);
          }}
        />

        {!categoryBrowse && (
          <section className="w-full" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex w-full flex-wrap items-center justify-start gap-2">
              {activeSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  type="button"
                  onClick={() => {
                    setSelectedSubcategory(subcategory);
                    setCategoryBrowse(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    selectedSubcategory === subcategory
                      ? "border-emerald-900 bg-emerald-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </section>
        )}

        {searchState ? (
          <section className="space-y-3" dir={isRtl ? "rtl" : "ltr"}>
            <h2 className="text-3xl font-black text-zinc-900">{t("searchResults")}</h2>
            <div className="flex flex-wrap gap-3">
              {lenderType === "private" &&
                searchProductsToRender.map((product) => <HomeCard key={product.id} product={product} />)}
              {lenderType === "company" &&
                searchCompaniesToRender.map((company) => <RentalCompanyCard key={company.id} company={company} />)}
              {lenderType === "private" && searchProductsToRender.length === 0 && <p className="text-sm text-zinc-500">{t("noPrivateResults")}</p>}
              {lenderType === "company" && searchCompaniesToRender.length === 0 && <p className="text-sm text-zinc-500">{t("noCompanyResults")}</p>}
            </div>
          </section>
        ) : categoryBrowse ? (
          <section className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
            <button
              type="button"
              onClick={() => setCategoryBrowse(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-950 hover:underline"
            >
              <ArrowLeft className={isRtl ? "rotate-180" : ""} size={18} aria-hidden />
              {t("backToHome")}
            </button>
            <h2 className="text-3xl font-black text-zinc-900">{browseSectionTitle}</h2>
            <div className="grid grid-cols-2 justify-items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {categoryBrowse.mode === "private" &&
                browsePrivateProducts.map((product) => <HomeCard key={product.id} product={product} layout="grid" />)}
              {categoryBrowse.mode === "company" &&
                browseCompanyList.map((company) => <RentalCompanyCard key={company.id} company={company} layout="grid" />)}
            </div>
            {categoryBrowse.mode === "private" && browsePrivateProducts.length === 0 && (
              <p className="text-sm text-zinc-500">{t("noPrivateResults")}</p>
            )}
            {categoryBrowse.mode === "company" && browseCompanyList.length === 0 && (
              <p className="text-sm text-zinc-500">{t("noCompanyResults")}</p>
            )}
          </section>
        ) : (
          <div className="space-y-5">
            {lenderType === "private" &&
              privateCategoriesToRender.map((category) => (
                <HomeSection
                  key={category.id}
                  category={category}
                  lenderType={lenderType}
                  display={homeSectionDisplay}
                  onSeeAll={
                    showHomeSeeAll ? () => setCategoryBrowse({ mode: "private", categoryId: category.id }) : undefined
                  }
                />
              ))}
            {lenderType === "company" &&
              companyCategoriesToRender.map((category) => (
                <RentalCompanySection
                  key={category.id}
                  category={category}
                  display={homeSectionDisplay}
                  onSeeAll={
                    showHomeSeeAll ? () => setCategoryBrowse({ mode: "company", blockId: category.id }) : undefined
                  }
                />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default HomePage;
