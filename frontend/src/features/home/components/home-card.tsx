import Image from "next/image";
import { Heart } from "lucide-react";
import { HomeProduct } from "../types/home";

interface HomeCardProps {
  product: HomeProduct;
}

export function HomeCard({ product }: HomeCardProps) {
  return (
    <article className="w-[145px] shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="relative h-[118px] bg-zinc-100">
        <Image src={product.imageUrl} alt={product.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
        <button
          type="button"
          aria-label={`Favorite ${product.title}`}
          className="absolute left-2 top-2 rounded-full border border-zinc-200 bg-white p-1.5 text-zinc-700 transition hover:bg-zinc-50"
        >
          <Heart size={13} />
        </button>
        <span className="absolute right-2 top-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-700">מועדף</span>
      </div>
      <div className="space-y-0.5 p-2 text-right" dir="rtl">
        <h3 className="truncate text-[11px] font-semibold text-zinc-900">{product.title}</h3>
        <p className="text-[10px] text-zinc-600">
          {product.city} · {product.rating.toFixed(1)} ⭐
        </p>
        <p className="text-[11px] font-semibold text-zinc-900">
          ₪{product.pricePerDay} <span className="text-zinc-500">/ day</span>
        </p>
      </div>
    </article>
  );
}
