"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { parseDemoDateDdMmYyyy, startOfLocalDay } from "../../lib/rental-demo-checkout";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { DemoRentalPaymentForm } from "../../components/demo-rental-payment-form";
import { useLocale } from "../../lib/locale-context";
import { myProductListings } from "../../lib/my-products.mock";
import { getProductDetails } from "../../pages/product-details/data/product-details.mock";
import { getRentalCatalogItemById, getRentalCompanyById } from "../../lib/rental-company-catalog.mock";
import { readRentalCompanyCart } from "../../lib/rental-company-cart";

export function CheckoutPage() {
  const { formatCurrency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const searchParams = useSearchParams();
  const [paymentComplete, setPaymentComplete] = useState(false);

  /** Same rental period + fee breakdown as «מוכנים לתשלום» when `listingId` matches mock. */
  const checkoutListing = useMemo(() => {
    if (!searchParams) return undefined;
    const lid = searchParams.get("listingId");
    if (!lid) return undefined;
    const hit = myProductListings.find((l) => (l.listingId ?? l.id) === lid);
    return hit?.rentalPaymentSummary ? hit : undefined;
  }, [searchParams]);

  const rentalPeriodStartIso = useMemo(() => {
    const label = checkoutListing?.rentalPaymentSummary?.dateFromLabel;
    if (!label) return undefined;
    const d = parseDemoDateDdMmYyyy(label);
    return d ? d.toISOString() : undefined;
  }, [checkoutListing]);

  const successRenterSub = useMemo((): "rentingSoon" | "current" => {
    const label = checkoutListing?.rentalPaymentSummary?.dateFromLabel;
    if (!label) return "current";
    const d = parseDemoDateDdMmYyyy(label);
    if (!d) return "current";
    return startOfLocalDay(new Date()) < startOfLocalDay(d) ? "rentingSoon" : "current";
  }, [checkoutListing]);

  const summary = useMemo(() => {
    if (!searchParams) return null;
    const type = searchParams.get("type");
    const listingId = searchParams.get("listingId") ?? undefined;
    if (type === "private") {
      const productId = searchParams.get("productId");
      if (!productId) return null;
      const p = getProductDetails(productId, language);
      return {
        kind: "private" as const,
        title: p.name,
        subtitle: t("perDay"),
        amountLabel: formatCurrency(p.pricePerDay),
        productId,
        listingId: listingId ?? `checkout-private-${productId}`,
        pricePerDay: p.pricePerDay,
      };
    }
    if (type === "company") {
      const companyId = searchParams.get("companyId");
      if (!companyId) return null;
      const company = getRentalCompanyById(companyId);
      if (!company) return null;
      const cart = readRentalCompanyCart(companyId);
      let cartTotal = 0;
      for (const [id, qty] of Object.entries(cart)) {
        const line = getRentalCatalogItemById(id);
        if (line && qty > 0) cartTotal += line.pricePerDay * qty;
      }
      const daily = cartTotal > 0 ? cartTotal : 420;
      return {
        kind: "company" as const,
        title: company.category,
        subtitle: t("companyCartGrandTotal"),
        amountLabel: formatCurrency(daily),
        companyId,
        listingId: listingId ?? `checkout-company-${companyId}`,
        pricePerDay: daily,
      };
    }
    return null;
  }, [formatCurrency, language, searchParams, t]);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/90" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-lg px-4 py-8 md:px-8">
        {!paymentComplete ? (
          <Link
            href="/my-products?mode=renter&renterSub=awaitingPayment"
            className={`mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("availabilityGoToMyRentals")}
          </Link>
        ) : null}

        {!paymentComplete ? (
          <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
            <h1 className="text-2xl font-black text-zinc-900">{t("checkoutTitle")}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t("checkoutDemoNote")}</p>
          </header>
        ) : null}

        {paymentComplete ? (
          <div
            className={`rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-8 shadow-sm ${isRtl ? "text-right" : "text-left"}`}
            role="status"
            aria-live="polite"
          >
            <div className={`flex flex-col gap-4 sm:flex-row sm:items-start ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              <CheckCircle2 className="h-14 w-14 shrink-0 text-emerald-700" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-emerald-950 sm:text-2xl">{t("checkoutPaymentSuccessTitle")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">{t("checkoutPaymentSuccessDescription")}</p>
                <Link
                  href={`/my-products?mode=renter&renterSub=${successRenterSub}`}
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 sm:w-auto"
                >
                  {t("checkoutPaymentSuccessCta")}
                </Link>
              </div>
            </div>
          </div>
        ) : summary ? (
          <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className={isRtl ? "text-right" : "text-left"}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">{t("checkoutOrderSummary")}</h2>
              <p className="mt-3 text-lg font-bold text-zinc-900">{summary.title}</p>
              {checkoutListing?.rentalPaymentSummary ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-zinc-500">{t("myProductsPaymentRentalDates")}</p>
                  <p className="mt-2 text-sm text-zinc-800">
                    <span className="font-semibold">{t("dateStartShort")}:</span> {checkoutListing.rentalPaymentSummary.dateFromLabel}{" "}
                    <span className="mx-1 text-zinc-400">·</span>
                    <span className="font-semibold">{t("dateEndShort")}:</span> {checkoutListing.rentalPaymentSummary.dateToLabel}
                  </p>
                  <div className="mt-4 border-t border-zinc-200 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("myProductsPaymentDetails")}</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                      <li className="flex justify-between gap-4">
                        <span>
                          {formatCurrency(checkoutListing.pricePerDay)} × {checkoutListing.rentalPaymentSummary.billableDays}{" "}
                          {t("myProductsPaymentDays")}
                        </span>
                        <span className="shrink-0 font-medium tabular-nums">
                          {formatCurrency(checkoutListing.pricePerDay * checkoutListing.rentalPaymentSummary.billableDays)}
                        </span>
                      </li>
                      <li className="flex justify-between gap-4 border-t border-zinc-200 pt-2 text-lg font-black tabular-nums text-emerald-950">
                        <span>{t("myProductsPaymentTotalDue")}</span>
                        <span className="shrink-0">
                          {formatCurrency(checkoutListing.pricePerDay * checkoutListing.rentalPaymentSummary.billableDays)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-zinc-600">{summary.subtitle}</p>
                  <p className="mt-4 text-2xl font-black tabular-nums text-emerald-950">{summary.amountLabel}</p>
                </>
              )}
            </div>
            <DemoRentalPaymentForm
              listingId={summary.listingId}
              kind={summary.kind}
              productId={summary.kind === "private" ? summary.productId : undefined}
              companyId={summary.kind === "company" ? summary.companyId : undefined}
              rentalPeriodStartIso={rentalPeriodStartIso}
              pickupWhenLabel={
                checkoutListing?.rentalPaymentSummary
                  ? `${t("dateStartShort")}: ${checkoutListing.rentalPaymentSummary.dateFromLabel}`
                  : undefined
              }
              pickupWhereLabel={t("myProductsRentingSoonPickupDefaultWhere")}
              onSuccess={() => {
                setPaymentComplete(true);
              }}
            />
          </section>
        ) : (
          <p className="rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-600">{t("myProductsEmpty")}</p>
        )}
      </div>
    </main>
  );
}
