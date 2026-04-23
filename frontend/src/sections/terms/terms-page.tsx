"use client";

import { useLocale } from "../../lib/locale-context";
import { DynamicBackLink } from "../../components/layout/dynamic-back-link";

export function TermsPage() {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <DynamicBackLink
          className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`}
        />
        <h1 className={`mt-6 text-3xl font-black tracking-tight text-zinc-900 ${isRtl ? "text-right" : "text-left"}`}>
          {t("termsPageTitle")}
        </h1>
        <div
          className={`mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm ${isRtl ? "text-right" : "text-left"}`}
        >
          <p>{t("termsPageIntro")}</p>
          <p>{t("termsPageBody1")}</p>
          <p>{t("termsPageBody2")}</p>
        </div>
      </div>
    </main>
  );
}
