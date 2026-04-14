import Image from "next/image";
import { ProductDetailsItem } from "../types/product-details";

interface ImageGalleryProps {
  product: ProductDetailsItem;
}

export function ImageGallery({ product }: ImageGalleryProps) {
  const mainSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 720px";
  const thumbSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px";

  return (
    <section className="grid gap-2 md:grid-cols-3">
      <div className="relative aspect-[4/3] w-full min-h-[11rem] overflow-hidden rounded-xl bg-zinc-100 md:col-span-2 md:aspect-[21/9] md:min-h-[17.5rem]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes={mainSizes}
          priority
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2">
        {product.images.slice(1, 3).map((imageUrl, index) => (
          <div
            key={`${index}-${imageUrl}`}
            className="relative aspect-[4/3] w-full min-h-[5.5rem] overflow-hidden rounded-xl bg-zinc-100 md:aspect-auto md:min-h-0 md:h-[156px]"
          >
            <Image src={imageUrl} alt={`${product.name} ${index + 2}`} fill sizes={thumbSizes} className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ImageGalleryPage() {
  return null;
}
