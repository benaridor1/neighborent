"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { AppLanguage, useLocale } from "../../lib/locale-context";

const LANGUAGE_OPTIONS: Array<{ language: AppLanguage; title: string; region: string }> = [
  { language: "he", title: "Hebrew", region: "Israel" },
  { language: "ar", title: "Arabic", region: "Saudi Arabia" },
  { language: "ru", title: "Russian", region: "Russia" },
  { language: "en", title: "English", region: "United States" },
  { language: "fr", title: "French", region: "France" },
];

export function LocaleCurrencyModal() {
  const [tab, setTab] = useState<"language" | "currency">("language");
  const { language, currency, setLanguage, setCurrency, isLocaleModalOpen, closeLocaleModal, t } = useLocale();
  const isRtl = language === "he" || language === "ar";

  if (!isLocaleModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 p-4">
      <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-zinc-200 p-4">
          <button type="button" onClick={closeLocaleModal} className="rounded-full p-1 text-zinc-700 hover:bg-zinc-100">
            <X size={18} />
          </button>
          <div className="mt-2 flex gap-6">
            <button
              type="button"
              onClick={() => setTab("language")}
              className={`border-b pb-1 text-sm font-semibold ${tab === "language" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500"}`}
            >
              {t("localeTabLanguage")}
            </button>
            <button
              type="button"
              onClick={() => setTab("currency")}
              className={`border-b pb-1 text-sm font-semibold ${tab === "currency" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500"}`}
            >
              {t("localeTabCurrency")}
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === "language" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900">{t("translationLabel")}</p>
                    <p className="text-sm text-zinc-500">{t("translationDescription")}</p>
                  </div>
                  <span className="inline-flex h-7 w-12 items-center justify-end rounded-full bg-zinc-900 px-1">
                    <span className="h-5 w-5 rounded-full bg-white" />
                  </span>
                </div>
              </div>

              <h3 className="text-4xl font-black text-zinc-900">{t("chooseLanguageRegion")}</h3>

              <div className="grid gap-3 md:grid-cols-5">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.language}
                    type="button"
                    onClick={() => setLanguage(option.language)}
                    className={`rounded-xl border px-3 py-2 text-start ${language === option.language ? "border-zinc-800" : "border-zinc-200"}`}
                  >
                    <p className="font-semibold text-zinc-900">{option.title}</p>
                    <p className="text-sm text-zinc-500">{option.region}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-zinc-900">{t("chooseCurrency")}</h3>
              <p className="text-sm text-zinc-500">{t("currencyDescription")}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setCurrency("ILS")}
                  className={`rounded-xl border px-3 py-2 text-start ${currency === "ILS" ? "border-zinc-800" : "border-zinc-200"}`}
                >
                  <p className="font-semibold text-zinc-900">{t("israeliShekel")}</p>
                  <p className="text-sm text-zinc-500">ILS - ₪</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`rounded-xl border px-3 py-2 text-start ${currency === "USD" ? "border-zinc-800" : "border-zinc-200"}`}
                >
                  <p className="font-semibold text-zinc-900">{t("usDollar")}</p>
                  <p className="text-sm text-zinc-500">USD - $</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
