import { Globe, Menu } from "lucide-react";

export function TopNav() {
  return (
    <header className="flex items-center justify-between py-3">
      <div className="text-3xl font-black tracking-tight text-zinc-900">RENTO</div>
      <div className="flex items-center gap-3" dir="rtl">
        <button type="button" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
          הפוך למארח
        </button>
        <button type="button" className="rounded-full border border-zinc-200 p-2 text-zinc-700">
          <Globe size={14} />
        </button>
        <button type="button" className="rounded-full border border-zinc-200 p-2 text-zinc-700">
          <Menu size={14} />
        </button>
      </div>
    </header>
  );
}
