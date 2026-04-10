import { ChevronLeft } from "lucide-react";
import { HomeCategory, LenderType } from "../types/home";
import { HomeCard } from "./home-card";

interface HomeSectionProps {
  category: HomeCategory;
  lenderType: LenderType;
}

export function HomeSection({ category, lenderType }: HomeSectionProps) {
  const products = category.products.filter((item) => item.lenderType === lenderType);
  if (products.length === 0) return null;

  return (
    <section className="space-y-2 border-t border-zinc-200 pt-5 first:border-0 first:pt-0" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-[33px] leading-none font-black text-zinc-900">{category.title}</h2>
        <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700">
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

export default function HomeSectionPage() {
  return null;
}
