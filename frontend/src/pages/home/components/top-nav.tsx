import Link from "next/link";
import { Globe, Menu } from "lucide-react";

export function TopNav() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="text-[34px] font-black leading-none tracking-tight text-zinc-900">
        RENTO
      </Link>
      <div className="flex items-center gap-2" dir="rtl">
        <button type="button" className="text-sm font-medium text-zinc-700">
          הפוך למארח
        </button>
        <button type="button" className="rounded-full border border-zinc-200 p-2 text-zinc-700">
          <Globe size={13} />
        </button>
        <button type="button" className="rounded-full border border-zinc-200 p-2 text-zinc-700">
          <Menu size={13} />
        </button>
      </div>
    </header>
  );
}

export default function TopNavPage() {
  return null;
}
