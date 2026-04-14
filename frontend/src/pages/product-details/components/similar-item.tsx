import Image from "next/image";
import { ProductDetailsItem } from "../types/product-details";

interface SimilarItemProps {
  product: ProductDetailsItem;
}

export function SimilarItem({ product }: SimilarItemProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 text-right" dir="rtl">
      <h3 className="text-base font-bold text-zinc-900">ציוד דומה שעשוי לעניין אותך</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          <Image src={product.images[0]} alt={product.name} fill sizes="128px" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{product.name}</p>
          <p className="text-xs text-zinc-600">
            {product.city} · {product.rating.toFixed(1)} ⭐
          </p>
          <p className="text-sm font-bold text-zinc-900">₪{product.pricePerDay} / יום</p>
        </div>
      </div>
    </section>
  );
}

export default function SimilarItemPage() {
  return null;
}
