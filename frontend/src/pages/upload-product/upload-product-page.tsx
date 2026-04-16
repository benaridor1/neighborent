"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ImageIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LISTING_CONDITION_IDS,
  SEARCH_CATEGORY_IDS,
  SEARCH_CATEGORY_LABEL_KEYS,
  type ListingConditionId,
  type SearchCategoryId,
} from "../../lib/catalog-search-constants";
import { isUserAuthenticated } from "../../lib/auth-session";
import { getCityOptionsForLanguage } from "../../lib/geo-search-options";
import { useLocale } from "../../lib/locale-context";
import { saveUploadedOwnerListing } from "../../lib/uploaded-owner-listings";
import type { DemoCategoryKey } from "../../lib/demo-category-images";

const LISTING_DRAFT_KEY = "rentup:listing-draft-v1";
const PHOTO_SLOTS = ["front", "back", "right", "left"] as const;
type PhotoSlot = (typeof PHOTO_SLOTS)[number];

type Step = 1 | 2 | 3;

function categoryLabel(id: SearchCategoryId, t: (k: string) => string) {
  return t(SEARCH_CATEGORY_LABEL_KEYS[id]);
}

function conditionLabel(id: ListingConditionId, t: (k: string) => string) {
  if (id === "new") return t("conditionNew");
  if (id === "like_new") return t("conditionLikeNew");
  return t("conditionUsed");
}

export function UploadProductPage() {
  const router = useRouter();
  const { currency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [authReady, setAuthReady] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<SearchCategoryId | "">("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState<ListingConditionId | "">("");
  const [modelName, setModelName] = useState("");
  const [priceDay, setPriceDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [unitsTotal, setUnitsTotal] = useState("1");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<Record<PhotoSlot, File | null>>({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [previewUrls, setPreviewUrls] = useState<Record<PhotoSlot, string | null>>({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [banner, setBanner] = useState<string | null>(null);
  const fileInputs = useRef<Record<PhotoSlot, HTMLInputElement | null>>({
    front: null,
    back: null,
    right: null,
    left: null,
  });

  const cityOptions = useMemo(() => getCityOptionsForLanguage(language), [language]);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace("/login");
      return;
    }
    setAuthReady(true);
  }, [router]);

  useEffect(() => {
    if (!cityOptions.length) return;
    setCity((current) => (current && cityOptions.includes(current) ? current : cityOptions[0]));
  }, [cityOptions]);

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const setSlotFile = useCallback(
    (slot: PhotoSlot, file: File | null) => {
      setImages((prev) => ({ ...prev, [slot]: file }));
      setPreviewUrls((prev) => {
        revokeUrl(prev[slot]);
        const next = file ? URL.createObjectURL(file) : null;
        return { ...prev, [slot]: next };
      });
    },
    [revokeUrl],
  );

  useEffect(() => {
    return () => {
      PHOTO_SLOTS.forEach((slot) => revokeUrl(previewUrls[slot]));
    };
  }, [previewUrls, revokeUrl]);

  const currencySuffix = currency === "ILS" ? "₪" : "$";

  const stepsMeta = useMemo(
    () => [
      { n: 1 as const, label: t("uploadStep1Short") },
      { n: 2 as const, label: t("uploadStep2Short") },
      { n: 3 as const, label: t("uploadStep3Short") },
    ],
    [t],
  );

  const slotLabel = (slot: PhotoSlot) => {
    if (slot === "front") return t("uploadSlotFront");
    if (slot === "back") return t("uploadSlotBack");
    if (slot === "right") return t("uploadSlotRight");
    return t("uploadSlotLeft");
  };

  const validateStep1 = () => Boolean(category && city && condition && modelName.trim());
  const validateStep2 = () => {
    const price = Number(priceDay);
    const units = Number(unitsTotal);
    return Boolean(images.front && !Number.isNaN(price) && price > 0 && Number.isInteger(units) && units > 0);
  };

  const goNext = () => {
    setBanner(null);
    if (step === 1) {
      if (!validateStep1()) {
        setBanner(t("uploadErrorStep1"));
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validateStep2()) {
        setBanner(t("uploadErrorStep2"));
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setBanner(null);
    if (step === 1) {
      router.push("/my-products?mode=owner&ownerSub=available");
      return;
    }
    setStep((s) => (s === 2 ? 1 : 2));
  };

  const saveDraft = () => {
    try {
      const payload = {
        category,
        city,
        condition,
        modelName,
        priceDay,
        deposit,
        unitsTotal,
        description,
        step: step,
      };
      window.localStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify(payload));
      setBanner(t("uploadDraftSaved"));
    } catch {
      setBanner(t("uploadDraftSaved"));
    }
  };

  const publish = () => {
    if (!validateStep1()) {
      setStep(1);
      setBanner(t("uploadErrorStep1"));
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      setBanner(t("uploadErrorStep2"));
      return;
    }
    setBanner(null);
    const selectedCategory = (category || "photo") as DemoCategoryKey;
    saveUploadedOwnerListing({
      name: modelName.trim(),
      pricePerDay: Number(priceDay),
      unitsTotal: Number(unitsTotal),
      category: selectedCategory,
    });
    router.push("/my-products?mode=owner&ownerSub=available");
  };

  if (!authReady) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-zinc-50/80 px-4" dir={isRtl ? "rtl" : "ltr"}>
        <p className="text-sm text-zinc-600">{t("uploadAuthRedirect")}</p>
      </main>
    );
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-emerald-950/10 md:max-w-xl";

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80 pb-28" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 lg:px-10">
        <div className="mb-6">
          <Link
            href="/my-products?mode=owner&ownerSub=available"
            className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("uploadBack")}
          </Link>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">{t("uploadProductTitle")}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">{t("uploadProductSubtitle")}</p>
          <p className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {language === "he"
              ? "לאחר העלאת מוצר, המודעה תעבור אימות לפני פרסום."
              : "After upload, the listing will be verified before publishing."}
          </p>
        </header>

        <nav aria-label="Progress" className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
          {stepsMeta.map((s, index) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="flex items-center gap-2 sm:gap-3">
                {index > 0 ? <span className="hidden h-px w-6 bg-zinc-200 sm:block md:w-10" aria-hidden /> : null}
                <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      done ? "bg-emerald-950 text-white" : active ? "bg-emerald-950 text-white ring-2 ring-emerald-200" : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : s.n}
                  </span>
                  <span className={`hidden text-xs font-semibold sm:inline md:text-sm ${active ? "text-emerald-950" : "text-zinc-500"}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </nav>

        {banner ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">{banner}</p>
        ) : null}

        {step === 1 ? (
          <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-900">{t("uploadProductCategory")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SearchCategoryId | "")}
                className={inputClass}
                aria-label={t("uploadProductCategory")}
              >
                <option value="">{t("uploadProductSelectCategory")}</option>
                {SEARCH_CATEGORY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {categoryLabel(id, t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-900">{t("uploadProductCity")}</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} aria-label={t("uploadProductCity")}>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-900">{t("uploadProductConditionLabel")}</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingConditionId | "")}
                className={inputClass}
                aria-label={t("uploadProductConditionLabel")}
              >
                <option value="">{t("uploadProductSelectCondition")}</option>
                {LISTING_CONDITION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {conditionLabel(id, t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-900">{t("uploadProductModelLabel")}</label>
              <p className="text-xs text-zinc-500">{t("uploadProductModelHint")}</p>
              <input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={t("productOrModelPlaceholder")}
                className={inputClass}
              />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-zinc-900">{t("uploadSectionPhotos")}</h2>
              <p className="mt-1 text-sm text-zinc-600">{t("uploadSectionPhotosHint")}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PHOTO_SLOTS.map((slot) => (
                  <div key={slot} className="relative">
                    <input
                      ref={(el) => {
                        fileInputs.current[slot] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setSlotFile(slot, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputs.current[slot]?.click()}
                      className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 p-2 text-center transition hover:border-emerald-900/30 hover:bg-white"
                    >
                      {previewUrls[slot] ? (
                        <img src={previewUrls[slot]!} alt="" className="h-28 w-full rounded-lg object-cover sm:h-32" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-zinc-400" aria-hidden />
                      )}
                      <span className="text-xs font-semibold text-zinc-800">{slotLabel(slot)}</span>
                      {slot === "front" ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-950">{t("uploadBadgeRequired")}</span>
                      ) : null}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-900">
                    {t("uploadPricePerDay")} ({currencySuffix})*
                  </label>
                  <input
                    type="number"
                    min={1}
                    inputMode="decimal"
                    value={priceDay}
                    onChange={(e) => setPriceDay(e.target.value)}
                    placeholder={t("uploadPlaceholderPrice")}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-900">
                    {t("uploadDepositLabel")} ({currencySuffix})*
                  </label>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder={t("uploadPlaceholderDeposit")}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="block text-sm font-semibold text-zinc-900">כמות יחידות זמינות להשכרה*</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={unitsTotal}
                  onChange={(e) => setUnitsTotal(e.target.value)}
                  placeholder="לדוגמה: 3"
                  className={inputClass}
                />
              </div>
              <p className="mt-4 rounded-xl bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950 ring-1 ring-amber-100">{t("uploadFeeNotice")}</p>
            </section>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-zinc-900">{t("uploadSectionDescription")}</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("uploadDescriptionPlaceholder")}
                rows={6}
                className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-950/10"
              />
            </section>
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-zinc-900">{t("uploadSectionPolicy")}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{t("uploadPolicyBody")}</p>
            </section>
          </div>
        ) : null}

        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8 lg:px-10 ${isRtl ? "rtl" : "ltr"}`}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 sm:gap-3">
            {step < 3 ? (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  {t("uploadBack")}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="ms-auto min-h-[44px] rounded-xl bg-emerald-950 px-6 text-sm font-semibold text-white hover:bg-emerald-900"
                >
                  {t("uploadProductContinue")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  {t("uploadBack")}
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  {t("uploadSaveDraft")}
                </button>
                <button
                  type="button"
                  onClick={publish}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-950 px-6 text-sm font-semibold text-white hover:bg-emerald-900"
                >
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  {t("uploadPublish")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function UploadProductTemplatePage() {
  return null;
}
