"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { AvailabilityRequestSentDialog } from "../../components/availability-request-sent-dialog";
import { RentalDatesPickerModal } from "../../components/rental-dates-picker-modal";
import {
  getRentalCompanyById,
  getRentalCompanyCatalogSections,
  getRentalCatalogItemById,
  RENTAL_CATALOG_SECTION_PREVIEW,
  rentalCatalogDisplayName,
  rentalCatalogSectionTitle,
  type RentalCompanyCatalogItem,
} from "../../lib/rental-company-catalog.mock";
import { appendCompanyCartAvailabilityRequest } from "../../lib/renter-availability-requests";
import { readRentalCompanyCart, RENTAL_CART_CHANGE_EVENT, removeRentalCartProduct, setRentalCartProductQty } from "../../lib/rental-company-cart";
import { formatRentalIsoForDisplay, readRentalBookingDates, RENTAL_BOOKING_DATES_EVENT } from "../../lib/rental-booking-dates";
import { useLocale } from "../../lib/locale-context";

interface RentalCompanyPageProps {
  companyId: string;
  /** When set, that catalog section shows all products instead of the preview count. */
  expandSectionId?: string | null;
}

export function RentalCompanyPage({ companyId, expandSectionId = null }: RentalCompanyPageProps) {
  const { formatCurrency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const company = useMemo(() => getRentalCompanyById(companyId), [companyId]);
  const sections = useMemo(() => getRentalCompanyCatalogSections(companyId), [companyId]);
  const [cartBump, setCartBump] = useState(0);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [datesPickerOpen, setDatesPickerOpen] = useState(false);

  const refreshDatesFromStorage = useCallback(() => {
    const { startIso, endIso } = readRentalBookingDates();
    setDateStart(startIso ?? "");
    setDateEnd(endIso ?? "");
  }, []);

  useEffect(() => {
    refreshDatesFromStorage();
    window.addEventListener(RENTAL_BOOKING_DATES_EVENT, refreshDatesFromStorage);
    return () => window.removeEventListener(RENTAL_BOOKING_DATES_EVENT, refreshDatesFromStorage);
  }, [refreshDatesFromStorage]);

  useEffect(() => {
    const onChange = () => setCartBump((n) => n + 1);
    window.addEventListener(RENTAL_CART_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(RENTAL_CART_CHANGE_EVENT, onChange);
  }, []);

  const cartLines = useMemo(() => {
    void cartBump;
    const cart = readRentalCompanyCart(companyId);
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = getRentalCatalogItemById(id);
        if (!product || qty <= 0) return null;
        return { product, qty, lineTotal: product.pricePerDay * qty };
      })
      .filter(Boolean) as { product: RentalCompanyCatalogItem; qty: number; lineTotal: number }[];
  }, [companyId, cartBump]);

  const cartTotalPerDay = useMemo(() => cartLines.reduce((sum, line) => sum + line.lineTotal, 0), [cartLines]);

  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [availabilitySentOpen, setAvailabilitySentOpen] = useState(false);

  const hasProducts = sections.some((s) => s.products.length > 0);

  if (!company || !hasProducts) {
    return (
      <main className="min-h-[calc(100vh-70px)] bg-zinc-50 px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
        <p className="text-center text-sm text-zinc-600">{t("companyNotFound")}</p>
        <Link href="/" className="mt-4 block text-center text-sm font-semibold text-emerald-900 hover:underline">
          {t("companyBackHome")}
        </Link>
      </main>
    );
  }

  const checkCartAvailability = () => {
    if (cartLines.length === 0) {
      setCartNotice(t("companyCartEmpty"));
      return;
    }
    setCartNotice(null);
    const summaryLines = cartLines.map(({ product, qty }) => `${rentalCatalogDisplayName(product, language)} × ${qty}`).join(" · ");
    appendCompanyCartAvailabilityRequest({
      companyId,
      companyName: company.category,
      summaryLines,
      totalPerDay: cartTotalPerDay,
      imageUrl: company.imageUrl,
    });
    setAvailabilitySentOpen(true);
  };

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50 pb-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
        <div className={`mb-4 ${isRtl ? "text-right" : "text-left"}`}>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-zinc-900">
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("companyBackHome")}
          </Link>
        </div>

        <header className={`mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative mx-auto h-28 w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:mx-0 sm:h-32 sm:w-40">
              <Image src={company.imageUrl} alt="" fill className="object-cover" sizes="200px" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">{t("categoryRentalCompanies")}</p>
              <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">{company.category}</h1>
              <p className="text-sm text-zinc-600">
                {isRtl ? company.region : t("locationIsrael")} · {company.rating.toFixed(1)} ⭐
              </p>
            </div>
          </div>
        </header>

        {cartNotice ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">{cartNotice}</p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-10">
            {sections.map((section) => {
              if (section.products.length === 0) return null;
              const showAll = expandSectionId === section.id;
              const visible = showAll ? section.products : section.products.slice(0, RENTAL_CATALOG_SECTION_PREVIEW);
              const moreCount = showAll ? 0 : Math.max(0, section.products.length - RENTAL_CATALOG_SECTION_PREVIEW);
              const seeAllHref = showAll ? `/rental-companies/${companyId}` : `/rental-companies/${companyId}?expand=${encodeURIComponent(section.id)}`;

              const productCards = visible.map((product) => {
                const title = rentalCatalogDisplayName(product, language);
                return (
                  <div key={product.id} className="w-[154px] shrink-0">
                    <Link
                      href={`/products/${encodeURIComponent(product.id)}`}
                      className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-900/25 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full bg-zinc-100">
                        <Image src={product.imageUrl} alt={title} fill className="object-cover" sizes="160px" />
                      </div>
                      <div className={`space-y-1 p-2.5 ${isRtl ? "text-right" : "text-left"}`}>
                        <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-bold leading-snug text-zinc-900">{title}</h3>
                        <p className="text-xs font-semibold text-zinc-800">
                          {formatCurrency(product.pricePerDay)} <span className="font-medium text-zinc-500">{t("perDay")}</span>
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              });

              const moreBadge =
                moreCount > 0 ? (
                  <span
                    className="inline-flex shrink-0 items-center self-center rounded-full bg-emerald-950 px-3 py-1.5 text-sm font-black text-white shadow-sm tabular-nums"
                    aria-hidden
                  >
                    +{moreCount}
                  </span>
                ) : null;

              const seeAllLink = (
                <Link
                  href={seeAllHref}
                  scroll={false}
                  className="inline-flex shrink-0 items-center gap-1 py-1 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
                >
                  {showAll ? t("seeLess") : t("seeAll")}{" "}
                  <ChevronLeft size={14} className={isRtl ? "" : "rotate-180"} />
                </Link>
              );

              return (
                <section key={section.id} className="space-y-3">
                  <h2 className={`text-lg font-black text-zinc-900 md:text-xl ${isRtl ? "text-right" : "text-left"}`}>
                    {rentalCatalogSectionTitle(section, language)}
                  </h2>
                  <div className="min-w-0 w-full overflow-x-auto pb-2">
                    <div className="flex w-max items-center gap-2" dir={isRtl ? "rtl" : "ltr"}>
                      {isRtl ? (
                        <>
                          {productCards}
                          {moreBadge}
                          {seeAllLink}
                        </>
                      ) : (
                        <>
                          {seeAllLink}
                          {moreBadge}
                          {productCards}
                        </>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
              <h2 className="text-lg font-bold text-zinc-900">{t("companyCartTitle")}</h2>
              <p className="mt-1 text-xs text-zinc-500">{t("companyCartFromProductHint")}</p>
              {cartLines.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">{t("companyCartEmpty")}</p>
              ) : (
                <ul className="mt-4 space-y-2.5 border-b border-zinc-100 pb-4">
                  {cartLines.map(({ product, qty, lineTotal }) => (
                    <li
                      key={product.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 shadow-sm"
                    >
                      <Link
                        href={`/products/${encodeURIComponent(product.id)}`}
                        className="block text-sm font-semibold leading-snug text-emerald-950 hover:underline"
                      >
                        <span className="line-clamp-2">{rentalCatalogDisplayName(product, language)}</span>
                      </Link>
                      <dl className={`mt-2.5 space-y-1.5 text-xs ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-500">
                          <dt className="font-medium">{t("companyQuantity")}</dt>
                          <dd className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title={t("companyCartQtyDown")}
                              aria-label={t("companyCartQtyDown")}
                              disabled={qty <= 1}
                              onClick={() => setRentalCartProductQty(companyId, product.id, qty - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-zinc-900">{qty}</span>
                            <button
                              type="button"
                              title={t("companyCartQtyUp")}
                              aria-label={t("companyCartQtyUp")}
                              disabled={qty >= 99}
                              onClick={() => setRentalCartProductQty(companyId, product.id, qty + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              title={t("companyCartRemoveItem")}
                              aria-label={t("companyCartRemoveItem")}
                              onClick={() => removeRentalCartProduct(companyId, product.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 shadow-sm hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3 border-t border-zinc-200/90 pt-2">
                          <dt className="min-w-0 flex-1 leading-relaxed text-zinc-600">
                            <span className="tabular-nums">{formatCurrency(product.pricePerDay)}</span>
                            <span className="text-zinc-400"> {t("perDay")}</span>
                            <span className="text-zinc-400"> × {qty}</span>
                          </dt>
                          <dd className="shrink-0 text-base font-black tabular-nums text-emerald-950">{formatCurrency(lineTotal)}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
              <div
                className={`mt-4 flex items-stretch justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 ${isRtl ? "text-right" : "text-left"}`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-sm font-bold text-zinc-900">{t("companyCartGrandTotal")}</span>
                  <span className="mt-0.5 text-[11px] font-medium text-zinc-500">{t("perDay")}</span>
                </div>
                <div className="shrink-0 self-center text-2xl font-black tabular-nums text-emerald-950">{formatCurrency(cartTotalPerDay)}</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className={`flex flex-col gap-1 text-xs ${isRtl ? "items-end" : "items-start"}`}>
                  <span className="font-semibold text-zinc-600">{t("dateStartShort")}</span>
                  <button
                    type="button"
                    onClick={() => setDatesPickerOpen(true)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-2 text-start text-sm text-zinc-800 shadow-sm outline-none hover:border-emerald-900/30 hover:bg-zinc-50 focus:ring-2 focus:ring-emerald-950/15"
                  >
                    {formatRentalIsoForDisplay(dateStart, t("monthMay"), t("monthJune")) || t("companyCartPickDates")}
                  </button>
                </div>
                <div className={`flex flex-col gap-1 text-xs ${isRtl ? "items-end" : "items-start"}`}>
                  <span className="font-semibold text-zinc-600">{t("dateEndShort")}</span>
                  <button
                    type="button"
                    onClick={() => setDatesPickerOpen(true)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-2 text-start text-sm text-zinc-800 shadow-sm outline-none hover:border-emerald-900/30 hover:bg-zinc-50 focus:ring-2 focus:ring-emerald-950/15"
                  >
                    {formatRentalIsoForDisplay(dateEnd, t("monthMay"), t("monthJune")) || t("companyCartPickDates")}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={checkCartAvailability}
                className="mt-3 w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                {t("companyCheckCartAvailability")}
              </button>
            </div>
          </aside>
        </div>
      </div>
      <RentalDatesPickerModal open={datesPickerOpen} onClose={() => setDatesPickerOpen(false)} />
      <AvailabilityRequestSentDialog open={availabilitySentOpen} onClose={() => setAvailabilitySentOpen(false)} />
    </main>
  );
}

export default function RentalCompanyTemplatePage() {
  return null;
}
