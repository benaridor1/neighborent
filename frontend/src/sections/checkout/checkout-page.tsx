"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { DemoRentalPaymentForm } from "../../components/demo-rental-payment-form";
import { useLocale } from "../../lib/locale-context";
import { getProductDetails } from "../../pages/product-details/data/product-details.mock";
import { getRentalCatalogItemById, getRentalCompanyById } from "../../lib/rental-company-catalog.mock";
import { readRentalCompanyCart } from "../../lib/rental-company-cart";

export function CheckoutPage() {
  const { formatCurrency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

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
      return {
        kind: "company" as const,
        title: company.category,
        subtitle: t("companyCartGrandTotal"),
        amountLabel: formatCurrency(cartTotal > 0 ? cartTotal : 420),
        companyId,
        listingId: listingId ?? `checkout-company-${companyId}`,
      };
    }
    return null;
  }, [formatCurrency, language, searchParams, t]);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/90" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-lg px-4 py-8 md:px-8">
        <Link
          href="/my-products?mode=renter&renterSub=awaitingPayment"
          className={`mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
          {t("availabilityGoToMyRentals")}
        </Link>

        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
          <h1 className="text-2xl font-black text-zinc-900">{t("checkoutTitle")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("checkoutDemoNote")}</p>
        </header>

        {summary ? (
          <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">{t("checkoutOrderSummary")}</h2>
              <p className="mt-3 text-lg font-bold text-zinc-900">{summary.title}</p>
              <p className="mt-1 text-sm text-zinc-600">{summary.subtitle}</p>
              <p className="mt-4 text-2xl font-black tabular-nums text-emerald-950">{summary.amountLabel}</p>
            </div>
            <DemoRentalPaymentForm
              listingId={summary.listingId}
              kind={summary.kind}
              productId={summary.kind === "private" ? summary.productId : undefined}
              companyId={summary.kind === "company" ? summary.companyId : undefined}
              onSuccess={() => {
                router.push("/my-products?mode=renter&renterSub=current");
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
