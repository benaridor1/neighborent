"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, Clock3, MessageCircle, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoRentalPaymentForm } from "../../components/demo-rental-payment-form";
import { useLocale } from "../../lib/locale-context";
import {
  myProductListings,
  type MyProductListing,
  type MyProductOwnerSub,
  type MyProductRenterSub,
} from "../../lib/my-products.mock";
import {
  approveOwnerRentalRequest,
  declineOwnerRentalRequest,
  readApprovedOwnerRentalRequestIds,
  readDeclinedOwnerRentalRequestIds,
} from "../../lib/owner-rental-request-state";
import { isDemoListingPaid, listDemoPostCheckoutRecords, type DemoPostCheckoutRecord } from "../../lib/rental-demo-checkout";
import { listPendingAvailabilityRequests, mapAvailabilityRecordToListing } from "../../lib/renter-availability-requests";

type MainMode = "owner" | "renter";

const RENTER_SUB_URL_VALUES: MyProductRenterSub[] = ["pendingApproval", "awaitingPayment", "current", "past"];
const OWNER_SUB_URL_VALUES: MyProductOwnerSub[] = ["available", "rentalRequestsPending", "upcomingRental", "leasedOut"];

function parseRenterSubParam(value: string | null): MyProductRenterSub | null {
  if (!value) return null;
  return RENTER_SUB_URL_VALUES.includes(value as MyProductRenterSub) ? (value as MyProductRenterSub) : null;
}

function parseOwnerSubParam(value: string | null): MyProductOwnerSub | null {
  if (!value) return null;
  return OWNER_SUB_URL_VALUES.includes(value as MyProductOwnerSub) ? (value as MyProductOwnerSub) : null;
}

function isOwnerListing(item: MyProductListing) {
  return item.ownerSub !== undefined;
}

function listingCheckoutId(item: MyProductListing): string {
  return item.listingId ?? item.id;
}

function ownerItemMatchesOwnerTab(
  item: MyProductListing,
  tab: MyProductOwnerSub,
  approvedIds: Set<string>,
  declinedIds: Set<string>,
): boolean {
  if (item.ownerSub === undefined) return false;
  if (item.ownerSub === "rentalRequestsPending") {
    if (declinedIds.has(item.id)) return false;
    if (approvedIds.has(item.id)) return tab === "upcomingRental";
    return tab === "rentalRequestsPending";
  }
  return item.ownerSub === tab;
}

export function MyProductsPage() {
  const { formatCurrency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mainMode, setMainMode] = useState<MainMode>("owner");
  const [ownerSub, setOwnerSub] = useState<MyProductOwnerSub>("available");
  const [renterSub, setRenterSub] = useState<MyProductRenterSub>("current");
  const [pendingBump, setPendingBump] = useState(0);
  const [ownerRequestBump, setOwnerRequestBump] = useState(0);
  const [checkoutBump, setCheckoutBump] = useState(0);
  const [expandedPayListingId, setExpandedPayListingId] = useState<string | null>(null);

  useEffect(() => {
    const onPendingChanged = () => setPendingBump((n) => n + 1);
    const onOwnerReq = () => setOwnerRequestBump((n) => n + 1);
    const onCheckout = () => setCheckoutBump((n) => n + 1);
    window.addEventListener("rentup:renter-availability-requests-changed", onPendingChanged);
    window.addEventListener("rentup:owner-rental-requests-changed", onOwnerReq);
    window.addEventListener("rentup:demo-post-checkout-changed", onCheckout);
    window.addEventListener("storage", onPendingChanged);
    return () => {
      window.removeEventListener("rentup:renter-availability-requests-changed", onPendingChanged);
      window.removeEventListener("rentup:owner-rental-requests-changed", onOwnerReq);
      window.removeEventListener("rentup:demo-post-checkout-changed", onCheckout);
      window.removeEventListener("storage", onPendingChanged);
    };
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const mode = searchParams.get("mode");
    const rSub = parseRenterSubParam(searchParams.get("renterSub"));
    const oSub = parseOwnerSubParam(searchParams.get("ownerSub"));
    if (mode === "renter") setMainMode("renter");
    if (mode === "owner") setMainMode("owner");
    if (rSub) setRenterSub(rSub);
    if (oSub) setOwnerSub(oSub);
  }, [searchParams]);

  const approvedOwnerIds = useMemo(() => {
    void ownerRequestBump;
    return new Set(readApprovedOwnerRentalRequestIds());
  }, [ownerRequestBump]);

  const declinedOwnerIds = useMemo(() => {
    void ownerRequestBump;
    return new Set(readDeclinedOwnerRentalRequestIds());
  }, [ownerRequestBump]);

  const storedPendingListings = useMemo(() => {
    void pendingBump;
    return listPendingAvailabilityRequests().map(mapAvailabilityRecordToListing);
  }, [pendingBump]);

  const postCheckoutRecords = useMemo(() => {
    void checkoutBump;
    return listDemoPostCheckoutRecords();
  }, [checkoutBump]);

  const filtered = useMemo(() => {
    if (mainMode === "owner") {
      return myProductListings.filter(
        (item) => item.ownerSub !== undefined && ownerItemMatchesOwnerTab(item, ownerSub, approvedOwnerIds, declinedOwnerIds),
      );
    }
    const base = myProductListings.filter((item) => {
      if (item.renterSub !== renterSub) return false;
      if (renterSub === "awaitingPayment" && isDemoListingPaid(listingCheckoutId(item))) return false;
      return true;
    });
    if (renterSub === "pendingApproval") {
      return [...storedPendingListings, ...base];
    }
    return base;
  }, [mainMode, ownerSub, renterSub, storedPendingListings, approvedOwnerIds, declinedOwnerIds]);

  const selectMainMode = useCallback(
    (mode: MainMode) => {
      setMainMode(mode);
      if (mode === "owner") {
        router.replace(`/my-products?mode=owner&ownerSub=${ownerSub}`, { scroll: false });
      } else {
        router.replace(`/my-products?mode=renter&renterSub=${renterSub}`, { scroll: false });
      }
    },
    [ownerSub, renterSub, router],
  );

  const selectOwnerSub = useCallback(
    (sub: MyProductOwnerSub) => {
      setOwnerSub(sub);
      router.replace(`/my-products?mode=owner&ownerSub=${sub}`, { scroll: false });
    },
    [router],
  );

  const selectRenterSub = useCallback(
    (sub: MyProductRenterSub) => {
      setRenterSub(sub);
      router.replace(`/my-products?mode=renter&renterSub=${sub}`, { scroll: false });
    },
    [router],
  );

  const statusClass: Record<string, string> = {
    unavailability: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/80",
    pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
    paymentDue: "bg-sky-50 text-sky-950 ring-1 ring-sky-200/80",
    live: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80",
    completed: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80",
  };

  function statusLabel(key: string) {
    if (key === "unavailability") return t("myProductsStatusUnavailability");
    if (key === "pending") return t("myProductsStatusPending");
    if (key === "paymentDue") return t("myProductsStatusPaymentDue");
    if (key === "completed") return t("myProductsStatusCompleted");
    return t("myProductsStatusLive");
  }

  function primaryLabel(action: string) {
    if (action === "confirmDelivery") return t("myProductsActionConfirmDelivery");
    if (action === "pickAvailability") return t("myProductsActionPickAvailability");
    if (action === "payNow") return t("myProductsActionPayNow");
    return t("myProductsActionMoreInfo");
  }

  function formatPaidAt(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(language === "he" || language === "ar" ? "he-IL" : "en-GB");
  }

  function renderPostCheckoutCard(rec: DemoPostCheckoutRecord) {
    return (
      <article
        key={rec.recordId}
        className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm"
      >
        <div className="flex flex-col gap-5 p-4 sm:p-5 md:flex-row md:items-stretch md:gap-6">
          <div className="relative mx-auto h-44 w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-white md:mx-0 md:h-40 md:w-52">
            <Image src={rec.imageUrl} alt={rec.productTitle} fill sizes="(max-width:768px) 100vw, 208px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className={`flex flex-col gap-2 ${isRtl ? "text-right" : "text-left"}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-900">{t("myProductsPostCheckoutBadge")}</p>
              <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">{rec.productTitle}</h2>
              <p className="text-sm text-zinc-600">
                {t("myProductsPostCheckoutPaidAt")}: {formatPaidAt(rec.paidAt)}
              </p>
              {rec.pricePerDay > 0 ? (
                <p className="text-base font-semibold text-zinc-900">
                  {formatCurrency(rec.pricePerDay)} <span className="text-sm font-medium text-zinc-500">{t("perDay")}</span>
                </p>
              ) : null}
            </div>
            <div className={`rounded-xl border border-emerald-100 bg-white p-4 ${isRtl ? "text-right" : "text-left"}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("myProductsLenderDetailsTitle")}</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">{rec.lenderDisplayName}</p>
              <p className="mt-1 text-sm text-zinc-700">{rec.lenderPhone}</p>
              <p className="mt-1 text-sm text-zinc-600">{rec.lenderEmail}</p>
            </div>
            <Link
              href={`/messages/${rec.messagesThreadPath}?from=checkout`}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              {t("myProductsOpenChatWithLender")}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const tabButton =
    "min-h-[44px] flex-1 rounded-xl px-3 text-sm font-semibold transition sm:min-w-0 sm:flex-none sm:px-5";

  const showPostCheckout = mainMode === "renter" && renterSub === "current" && postCheckoutRecords.length > 0;

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end sm:self-auto" : "self-start sm:self-auto"}`}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("backToHome")}
          </Link>
          <Link
            href="/upload-product"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 sm:shrink-0"
          >
            {t("myProductsUploadCta")}
          </Link>
        </div>

        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm sm:px-8">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">{t("menuRentals")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">{t("myProductsIntro")}</p>
        </header>

        <div
          role="tablist"
          aria-label={t("myProductsAriaMain")}
          className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mainMode === "owner"}
            onClick={() => selectMainMode("owner")}
            className={`${tabButton} ${mainMode === "owner" ? "bg-emerald-950 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-50"}`}
          >
            {t("myProductsMainOwner")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainMode === "renter"}
            onClick={() => selectMainMode("renter")}
            className={`${tabButton} ${mainMode === "renter" ? "bg-emerald-950 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-50"}`}
          >
            {t("myProductsMainRenter")}
          </button>
        </div>

        {mainMode === "owner" ? (
          <div
            role="tablist"
            aria-label={t("myProductsAriaSub")}
            className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={ownerSub === "available"}
              onClick={() => selectOwnerSub("available")}
              className={`${tabButton} ${ownerSub === "available" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsOwnerAvailable")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ownerSub === "rentalRequestsPending"}
              onClick={() => selectOwnerSub("rentalRequestsPending")}
              className={`${tabButton} ${ownerSub === "rentalRequestsPending" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsOwnerRentalRequests")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ownerSub === "upcomingRental"}
              onClick={() => selectOwnerSub("upcomingRental")}
              className={`${tabButton} ${ownerSub === "upcomingRental" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsOwnerUpcoming")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ownerSub === "leasedOut"}
              onClick={() => selectOwnerSub("leasedOut")}
              className={`${tabButton} ${ownerSub === "leasedOut" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsOwnerLeased")}
            </button>
          </div>
        ) : (
          <div
            role="tablist"
            aria-label={t("myProductsAriaSub")}
            className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={renterSub === "pendingApproval"}
              onClick={() => selectRenterSub("pendingApproval")}
              className={`${tabButton} ${renterSub === "pendingApproval" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsRenterPendingApproval")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={renterSub === "awaitingPayment"}
              onClick={() => selectRenterSub("awaitingPayment")}
              className={`${tabButton} ${renterSub === "awaitingPayment" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsRenterAwaitingPayment")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={renterSub === "current"}
              onClick={() => selectRenterSub("current")}
              className={`${tabButton} ${renterSub === "current" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsRenterCurrent")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={renterSub === "past"}
              onClick={() => selectRenterSub("past")}
              className={`${tabButton} ${renterSub === "past" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsRenterPast")}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {showPostCheckout ? (
            <div className="space-y-3">
              <h2 className={`text-sm font-bold text-zinc-800 ${isRtl ? "text-right" : "text-left"}`}>{t("myProductsPostCheckoutSectionTitle")}</h2>
              {postCheckoutRecords.map(renderPostCheckoutCard)}
            </div>
          ) : null}

          {filtered.length === 0 && !(showPostCheckout && renterSub === "current") ? (
            <p className="rounded-2xl border border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-600">{t("myProductsEmpty")}</p>
          ) : filtered.length === 0 ? null : (
            filtered.map((item) => {
              const owner = isOwnerListing(item);
              const detailHref = item.detailHref ?? `/products/${item.id}`;
              const lid = listingCheckoutId(item);
              const isPrivateAwaiting = !owner && item.renterSub === "awaitingPayment" && item.checkoutHref?.includes("type=private");
              const isCompanyAwaiting = !owner && item.renterSub === "awaitingPayment" && item.checkoutHref?.includes("type=company");
              const productIdFromCheckout = item.checkoutHref?.match(/productId=([^&]+)/)?.[1];
              const companyIdFromCheckout = item.checkoutHref?.match(/companyId=([^&]+)/)?.[1];

              return (
                <article
                  key={`${mainMode}-${item.id}-${owner ? item.ownerSub : item.renterSub}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300"
                >
                  <div className="flex flex-col gap-5 p-4 sm:p-5 md:flex-row md:items-stretch md:gap-6">
                    <Link
                      href={detailHref}
                      className="relative mx-auto block h-44 w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-zinc-100 md:mx-0 md:h-40 md:w-52"
                    >
                      <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width:768px) 100vw, 208px" className="object-cover" />
                    </Link>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className={`min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                          <Link href={detailHref} className="text-lg font-bold text-zinc-900 hover:underline sm:text-xl">
                            {item.name}
                          </Link>
                          {item.summaryLine ? <p className="mt-1 text-sm text-zinc-600">{item.summaryLine}</p> : null}
                          <p className="mt-1 text-base font-semibold text-zinc-900">
                            {formatCurrency(item.pricePerDay)} <span className="text-sm font-medium text-zinc-500">{t("perDay")}</span>
                          </p>
                        </div>
                        <span
                          className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass[item.statusKey] ?? "bg-zinc-100 text-zinc-800"}`}
                        >
                          {statusLabel(item.statusKey)}
                        </span>
                      </div>

                      {item.rentalRequest ? (
                        <div
                          className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 ${isRtl ? "text-right" : "text-left"}`}
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("myProductsRentalRequestBlockTitle")}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-800">
                            <span className="font-semibold">{item.rentalRequest.renterName}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
                              {item.rentalRequest.renterRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-700">
                            <span className="font-medium text-zinc-900">{t("dateStartShort")}:</span> {item.rentalRequest.dateFromLabel}{" "}
                            <span className="mx-1 text-zinc-400">·</span>
                            <span className="font-medium text-zinc-900">{t("dateEndShort")}:</span> {item.rentalRequest.dateToLabel}
                          </p>
                          <ul className={`mt-2 list-inside text-sm text-zinc-700 ${isRtl ? "list-disc text-right" : "list-disc text-left"}`}>
                            {item.rentalRequest.productLines.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                          <p className="mt-1 text-xs text-zinc-500">
                            {item.rentalRequest.kind === "companyCart" ? t("myProductsRentalRequestKindCompany") : t("myProductsRentalRequestKindPrivate")}
                          </p>
                          {owner && item.ownerSub === "rentalRequestsPending" ? (
                            <div className={`mt-4 flex flex-col gap-2 sm:flex-row ${isRtl ? "sm:flex-row-reverse" : ""}`}>
                              <button
                                type="button"
                                onClick={() => approveOwnerRentalRequest(item.id)}
                                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
                              >
                                {t("myProductsApproveRentalRequest")}
                              </button>
                              <button
                                type="button"
                                onClick={() => declineOwnerRentalRequest(item.id)}
                                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                              >
                                {t("myProductsDeclineRentalRequest")}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div
                        className={`flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 ${isRtl ? "justify-end" : "justify-start"}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                          <span>
                            <span className="block text-xs text-zinc-500">{t("myProductsPublishedAt")}</span>
                            {item.publishedAt}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                          <span>
                            <span className="block text-xs text-zinc-500">{t("myProductsRentalsCount")}</span>
                            {item.rentalsCount}
                          </span>
                        </span>
                      </div>

                      {!owner && item.renterSub === "awaitingPayment" ? (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4">
                          <button
                            type="button"
                            onClick={() => setExpandedPayListingId((cur) => (cur === lid ? null : lid))}
                            className="text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline"
                          >
                            {expandedPayListingId === lid ? t("myProductsHideInlinePay") : t("myProductsShowInlinePay")}
                          </button>
                          {expandedPayListingId === lid ? (
                            <div className="mt-4 space-y-3">
                              <DemoRentalPaymentForm
                                listingId={lid}
                                kind={isCompanyAwaiting ? "company" : "private"}
                                productId={isPrivateAwaiting ? productIdFromCheckout : undefined}
                                companyId={isCompanyAwaiting ? companyIdFromCheckout : undefined}
                                onSuccess={() => {
                                  setCheckoutBump((n) => n + 1);
                                  setExpandedPayListingId(null);
                                  selectRenterSub("current");
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className={`flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between`}>
                        <Link href={detailHref} className="text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline">
                          {owner ? t("myProductsEdit") : t("myProductsViewRental")}
                        </Link>
                        <div
                          className={`flex flex-col gap-2 sm:flex-row sm:items-center ${isRtl ? "sm:flex-row-reverse" : ""} ${owner ? "" : "sm:justify-end"}`}
                        >
                          {owner ? (
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                              aria-label={t("myProductsDeleteListing")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                          {!owner && item.primaryAction === "payNow" && item.checkoutHref ? (
                            <Link
                              href={item.checkoutHref}
                              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 sm:min-w-[200px]"
                            >
                              {primaryLabel(item.primaryAction)}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="min-h-[44px] rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 sm:min-w-[200px]"
                            >
                              {primaryLabel(item.primaryAction)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

export default function MyProductsTemplatePage() {
  return null;
}
