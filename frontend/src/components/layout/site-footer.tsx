"use client";

import Link from "next/link";
import { useLocale } from "../../lib/locale-context";

export function SiteFooter() {
  const { language } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-zinc-200 bg-zinc-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-2xl font-black tracking-tight text-zinc-900">neighborent</p>
            <p className="max-w-md text-sm text-zinc-600">
              הפלטפורמה להשכרת ציוד בין אנשים פרטיים וחברות - צילום, מחשוב, אירועים, בניה ועוד.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-sm text-zinc-700 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="font-semibold text-zinc-900">קישורים מהירים</p>
              <div className="flex flex-col gap-1.5">
                <Link href="/" className="hover:text-zinc-900 hover:underline">
                  עמוד הבית
                </Link>
                <Link href="/favorites" className="hover:text-zinc-900 hover:underline">
                  מועדפים
                </Link>
                <Link href="/messages" className="hover:text-zinc-900 hover:underline">
                  הודעות
                </Link>
                <Link href="/help" className="hover:text-zinc-900 hover:underline">
                  מרכז עזרה
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-zinc-900">יצירת קשר</p>
              <div className="flex flex-col gap-1.5">
                <a href="mailto:hello@neighborent.com" className="hover:text-zinc-900 hover:underline">
                  hello@neighborent.com
                </a>
                <a href="tel:+972501234567" className="hover:text-zinc-900 hover:underline">
                  050-123-4567
                </a>
                <p>שעות פעילות: א׳-ה׳ 09:00-18:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} neighborent. כל הזכויות שמורות.</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-zinc-700 hover:underline">
              תנאי שימוש
            </Link>
            <Link href="#" className="hover:text-zinc-700 hover:underline">
              מדיניות פרטיות
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
