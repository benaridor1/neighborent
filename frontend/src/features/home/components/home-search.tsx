import { Search } from "lucide-react";
import { ProviderType } from "../types/home";

interface HomeSearchProps {
  providerType: ProviderType;
  onProviderChange: (value: ProviderType) => void;
}

export function HomeSearch({ providerType, onProviderChange }: HomeSearchProps) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-3" dir="rtl">
      <div className="rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
        <div className="grid grid-cols-1 gap-1 md:grid-cols-[1fr_1fr_1fr_auto]">
          <button type="button" className="rounded-full px-5 py-2.5 text-right hover:bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-800">איפה</p>
            <p className="text-xs text-zinc-500">תל אביב והמרכז</p>
          </button>
          <button type="button" className="rounded-full px-5 py-2.5 text-right hover:bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-800">מתי</p>
            <p className="text-xs text-zinc-500">בחירת תאריכי השכרה</p>
          </button>
          <button type="button" className="rounded-full px-5 py-2.5 text-right hover:bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-800">מה מחפשים?</p>
            <p className="text-xs text-zinc-500">שם מוצר או דגם...</p>
          </button>
          <div className="flex items-center justify-center px-2">
            <button type="button" className="rounded-full bg-emerald-950 p-3 text-white">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto inline-flex rounded-xl bg-amber-50 p-1">
        <button
          type="button"
          onClick={() => onProviderChange("company")}
          className={`rounded-lg px-8 py-2 text-sm font-semibold ${providerType === "company" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-700"}`}
        >
          חברת השכרה
        </button>
        <button
          type="button"
          onClick={() => onProviderChange("private")}
          className={`rounded-lg px-8 py-2 text-sm font-semibold ${providerType === "private" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-700"}`}
        >
          משכיר פרטי
        </button>
      </div>
    </section>
  );
}
