import { Search } from "lucide-react";
export function HomeSearch() {
  return (
    <section className="mx-auto w-full max-w-3xl" dir="rtl">
      <div className="rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-1 md:grid-cols-[1fr_1fr_1fr_auto]">
          <button type="button" className="rounded-full px-5 py-2 text-right">
            <p className="text-xs font-bold text-zinc-900">איפה</p>
            <p className="text-xs text-zinc-500">תל אביב והמרכז</p>
          </button>
          <button type="button" className="rounded-full px-5 py-2 text-right">
            <p className="text-xs font-bold text-zinc-900">מתי</p>
            <p className="text-xs text-zinc-500">בחירת תאריכי השכרה</p>
          </button>
          <button type="button" className="rounded-full px-5 py-2 text-right">
            <p className="text-xs font-bold text-zinc-900">מה מחפשים?</p>
            <p className="text-xs text-zinc-500">שם מוצר או דגם...</p>
          </button>
          <div className="flex items-center justify-center px-1.5">
            <button type="button" className="rounded-full bg-emerald-950 p-3 text-white">
              <Search size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeSearchPage() {
  return null;
}
