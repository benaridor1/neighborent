import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { RentalCompany } from "../types/home";
import { useLocale } from "../../../lib/locale-context";

interface RentalCompanyCardProps {
  company: RentalCompany;
  layout?: "carousel" | "grid";
}

export function RentalCompanyCard({ company, layout = "carousel" }: RentalCompanyCardProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const regionLabel = isRtl ? company.region : t("locationIsrael");

  return (
    <article
      className={`overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:border-zinc-300 hover:shadow-sm ${
        layout === "grid" ? "mx-auto w-full max-w-[300px]" : "w-[188px] shrink-0"
      }`}
    >
      <Link href={`/rental-companies/${company.id}`} className="block">
        <div className="relative h-[110px] bg-zinc-100">
          <Image src={company.imageUrl} alt={company.category} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
        </div>
        <div className={`space-y-1 p-2 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          <p className="text-[12px] font-semibold text-zinc-900">{company.category}</p>
          <p className="text-[11px] text-zinc-600">{regionLabel}</p>
          <p className="inline-flex items-center gap-1 text-[11px] text-zinc-700">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {company.rating.toFixed(1)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default function RentalCompanyCardPage() {
  return null;
}
