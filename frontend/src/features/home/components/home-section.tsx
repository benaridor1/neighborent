import { ChevronLeft } from "lucide-react";
import { HomeCategory, ProviderType } from "../types/home";
import { HomeCard } from "./home-card";

interface HomeSectionProps {
  category: HomeCategory;
  providerType: ProviderType;
}

export function HomeSection({ category, providerType }: HomeSectionProps) {
  const products = category.products.filter((item) => item.providerType === providerType);
  if (products.length === 0) return null;

  return (
    <section className="space-y-3 border-t border-zinc-200 pt-4 first:border-0 first:pt-0" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-[30px] leading-none font-black text-zinc-900 md:text-[34px]">{category.title}</h2>
        <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-zinc-900">
          לראות הכל <ChevronLeft size={14} />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {products.map((product) => (
          <HomeCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
