"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MessageCircle } from "lucide-react";
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
import {
  listUploadedOwnerListings,
  ownerUploadedListingsChangedEventName,
} from "../../lib/uploaded-owner-listings";
import { DynamicBackLink } from "../../components/layout/dynamic-back-link";

type MainMode = "owner" | "renter";
type AllProductsLifecycleFilter = "all" | "available" | "rented";
type AllProductsVerificationFilter = "all" | "approved" | "rejected" | "pending";

const RENTER_SUB_URL_VALUES: MyProductRenterSub[] = ["pendingApproval", "awaitingPayment", "current", "past"];
const OWNER_SUB_URL_VALUES: MyProductOwnerSub[] = ["available", "rentalRequestsPending", "upcomingRental", "leasedOut", "verificationStatus", "allProducts"];
const OWNER_UNAVAILABILITY_KEY = "rentup:owner-unavailability-v1";

interface UnavailabilityRange {
  id: string;
  from: string;
  to: string;
}

type UnavailabilityByListing = Record<string, UnavailabilityRange[]>;
type CalendarRangeKind = "pastRental" | "futureRental" | "manualUnavailable";

interface CalendarRange {
  from: Date;
  to: Date;
  units: number;
  kind: CalendarRangeKind;
}

interface ListingVerificationMeta {
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

const DEMO_VERIFICATION_META_BY_LISTING_ID: Record<string, ListingVerificationMeta> = {
  p1: { status: "approved", submittedAt: "15.8.2025", verifiedAt: "16.8.2025" },
  t1: { status: "rejected", submittedAt: "3.9.2025", rejectedAt: "4.9.2025", rejectionReason: "חסרה תמונת חזית ברורה של המוצר." },
  "owner-upcoming-demo": { status: "pending", submittedAt: "21.4.2026" },
  p2: { status: "approved", submittedAt: "9.3.2025", verifiedAt: "10.3.2025" },
};

function readUnavailabilityByListing(): UnavailabilityByListing {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OWNER_UNAVAILABILITY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveUnavailabilityByListing(next: UnavailabilityByListing): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OWNER_UNAVAILABILITY_KEY, JSON.stringify(next));
}

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
  const [uploadedOwnerBump, setUploadedOwnerBump] = useState(0);
  const [expandedPayListingId, setExpandedPayListingId] = useState<string | null>(null);
  const [unavailabilityBump, setUnavailabilityBump] = useState(0);
  const [openUnavailabilityFor, setOpenUnavailabilityFor] = useState<string | null>(null);
  const [openCalendarFor, setOpenCalendarFor] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [unavailabilityPickerMonth, setUnavailabilityPickerMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [listingVerificationMeta, setListingVerificationMeta] = useState<Record<string, ListingVerificationMeta>>({});
  const [hiddenOwnerListingIds, setHiddenOwnerListingIds] = useState<string[]>([]);
  const [allProductsLifecycleFilter, setAllProductsLifecycleFilter] = useState<AllProductsLifecycleFilter>("all");
  const [allProductsVerificationFilter, setAllProductsVerificationFilter] = useState<AllProductsVerificationFilter>("all");

  useEffect(() => {
    const hasOpenModal = Boolean(openUnavailabilityFor || openCalendarFor);
    if (!hasOpenModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openUnavailabilityFor, openCalendarFor]);

  useEffect(() => {
    const onPendingChanged = () => setPendingBump((n) => n + 1);
    const onOwnerReq = () => setOwnerRequestBump((n) => n + 1);
    const onCheckout = () => setCheckoutBump((n) => n + 1);
    const onUploadedOwner = () => setUploadedOwnerBump((n) => n + 1);
    window.addEventListener("rentup:renter-availability-requests-changed", onPendingChanged);
    window.addEventListener("rentup:owner-rental-requests-changed", onOwnerReq);
    window.addEventListener("rentup:demo-post-checkout-changed", onCheckout);
    window.addEventListener(ownerUploadedListingsChangedEventName(), onUploadedOwner);
    window.addEventListener("storage", onPendingChanged);
    return () => {
      window.removeEventListener("rentup:renter-availability-requests-changed", onPendingChanged);
      window.removeEventListener("rentup:owner-rental-requests-changed", onOwnerReq);
      window.removeEventListener("rentup:demo-post-checkout-changed", onCheckout);
      window.removeEventListener(ownerUploadedListingsChangedEventName(), onUploadedOwner);
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

  const uploadedOwnerListings = useMemo<MyProductListing[]>(() => {
    void uploadedOwnerBump;
    return listUploadedOwnerListings().map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      pricePerDay: item.pricePerDay,
      ownerSub: "available",
      statusKey: "unavailability",
      publishedAt: item.publishedAt,
      rentalsCount: item.rentalsCount,
      unitsTotal: item.unitsTotal,
      primaryAction: "pickAvailability",
    }));
  }, [uploadedOwnerBump]);

  const unavailabilityByListing = useMemo(() => {
    void unavailabilityBump;
    return readUnavailabilityByListing();
  }, [unavailabilityBump]);

  const filtered = useMemo(() => {
    if (mainMode === "owner") {
      const base = myProductListings.filter(
        (item) => item.ownerSub !== undefined && ownerItemMatchesOwnerTab(item, ownerSub, approvedOwnerIds, declinedOwnerIds),
      );
      if (ownerSub === "allProducts") {
        const ownerAll = myProductListings.filter((item) => item.ownerSub !== undefined);
        const all = [...uploadedOwnerListings, ...ownerAll];
        return all
          .filter((item) => !hiddenOwnerListingIds.includes(item.id))
          .filter((item) => {
            const verificationMeta = listingVerificationMeta[item.id] ?? DEMO_VERIFICATION_META_BY_LISTING_ID[item.id];
            const isUploadedItem = item.id.startsWith("upl-");
            const verificationStatus: "pending" | "approved" | "rejected" = verificationMeta?.status ?? (isUploadedItem ? "pending" : "approved");
            const lifecycleStatus: "available" | "rented" =
              item.ownerSub === "leasedOut" || item.ownerSub === "upcomingRental" ? "rented" : "available";

            const lifecycleMatches =
              allProductsLifecycleFilter === "all" || allProductsLifecycleFilter === lifecycleStatus;
            const verificationMatches =
              allProductsVerificationFilter === "all" || allProductsVerificationFilter === verificationStatus;
            return lifecycleMatches && verificationMatches;
          });
      }
      if (ownerSub === "verificationStatus") {
        const ownerAll = myProductListings.filter((item) => item.ownerSub !== undefined);
        return [...uploadedOwnerListings, ...ownerAll];
      }
      if (ownerSub !== "available") return base;
      return [...uploadedOwnerListings, ...base];
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
  }, [
    mainMode,
    ownerSub,
    renterSub,
    storedPendingListings,
    approvedOwnerIds,
    declinedOwnerIds,
    uploadedOwnerListings,
    hiddenOwnerListingIds,
    listingVerificationMeta,
    allProductsLifecycleFilter,
    allProductsVerificationFilter,
  ]);

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

  function unitsAvailableLabel() {
    if (language === "he") return "יחידות זמינות";
    if (language === "ar") return "وحدات متاحة";
    if (language === "ru") return "Доступно единиц";
    if (language === "fr") return "Unités disponibles";
    return "Units available";
  }

  function formatUnavailabilityAction() {
    if (language === "he") return "מילוי אי זמינות";
    if (language === "ar") return "تعبئة عدم التوفر";
    if (language === "ru") return "Заполнить недоступность";
    if (language === "fr") return "Indisponibilités";
    return "Set unavailability";
  }

  function formatDateRangeLabel(from: string, to: string) {
    return `${from} - ${to}`;
  }

  function parseIsoDate(value: string): Date | null {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function parseDisplayDate(value: string): Date | null {
    const parts = value.split(".");
    if (parts.length !== 3) return null;
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function hashSeed(value: string) {
    let seed = 0;
    for (let i = 0; i < value.length; i += 1) {
      seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    }
    return seed;
  }

  function buildSyntheticRentalRanges(item: MyProductListing, unitsTotal: number): CalendarRange[] {
    const seed = hashSeed(item.id);
    const now = new Date();
    const pastCount = item.rentalsCount > 0 ? Math.min(3, Math.max(1, Math.floor(item.rentalsCount / 40) + 1)) : 0;
    const ranges: CalendarRange[] = [];

    for (let i = 0; i < pastCount; i += 1) {
      const monthOffset = i + 1;
      const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const startDay = 4 + ((seed + i * 7) % 18);
      const len = 2 + ((seed + i * 5) % 3);
      const from = new Date(month.getFullYear(), month.getMonth(), startDay);
      const to = new Date(month.getFullYear(), month.getMonth(), startDay + len);
      ranges.push({
        from,
        to,
        units: 1 + ((seed + i) % unitsTotal),
        kind: "pastRental",
      });
    }

    if (item.ownerSub === "upcomingRental" || item.rentalRequest?.dateFromLabel) {
      const reqFrom = item.rentalRequest?.dateFromLabel ? parseDisplayDate(item.rentalRequest.dateFromLabel) : null;
      const reqTo = item.rentalRequest?.dateToLabel ? parseDisplayDate(item.rentalRequest.dateToLabel) : null;
      const fallbackFrom = new Date(now.getFullYear(), now.getMonth(), 10 + (seed % 8));
      const fallbackTo = new Date(fallbackFrom.getFullYear(), fallbackFrom.getMonth(), fallbackFrom.getDate() + 3);
      ranges.push({
        from: reqFrom ?? fallbackFrom,
        to: reqTo ?? fallbackTo,
        units: Math.min(unitsTotal, 1 + (seed % unitsTotal)),
        kind: "futureRental",
      });
    }

    return ranges;
  }

  function buildManualUnavailableRanges(unavailableRanges: UnavailabilityRange[]): CalendarRange[] {
    return unavailableRanges
      .map((range) => {
        const from = parseIsoDate(range.from);
        const to = parseIsoDate(range.to);
        if (!from || !to) return null;
        return { from, to, units: 0, kind: "manualUnavailable" as const };
      })
      .filter((range): range is CalendarRange => Boolean(range));
  }

  function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isWithinRange(day: Date, range: CalendarRange) {
    const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const start = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime();
    const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()).getTime();
    return normalizedDay >= start && normalizedDay <= end;
  }

  function startOfWeek(day: Date) {
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const weekDay = d.getDay();
    d.setDate(d.getDate() - weekDay);
    return d;
  }

  function endOfWeek(day: Date) {
    const start = startOfWeek(day);
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    return d;
  }

  function monthLabel(value: Date) {
    const locale = language === "he" || language === "ar" ? "he-IL" : "en-GB";
    return value.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }

  function todayLabel() {
    const d = new Date();
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  }

  function verificationTabLabel() {
    if (language === "he") return "סטטוס אימות";
    if (language === "ar") return "حالة التحقق";
    if (language === "ru") return "Статус проверки";
    if (language === "fr") return "Statut de verification";
    return "Verification status";
  }

  function verificationStatusLabel(status: "pending" | "approved" | "rejected") {
    if (status === "pending") {
      if (language === "he") return "ממתין לאימות";
      return "Pending verification";
    }
    if (status === "rejected") {
      if (language === "he") return "לא אומת";
      return "Not verified";
    }
    if (language === "he") return "אומת";
    return "Verified";
  }

  function verificationSubmittedLabel() {
    return language === "he" ? "נשלח לאימות" : "Sent for verification";
  }

  function verificationApprovedAtLabel() {
    return language === "he" ? "אומת בתאריך" : "Verified at";
  }

  function verificationReasonLabel() {
    return language === "he" ? "סיבה לאי אימות" : "Verification issue";
  }

  function verificationRejectedAtLabel() {
    return language === "he" ? "תאריך קבלת סירוב" : "Rejection date";
  }

  function allProductsTabLabel() {
    return language === "he" ? "כל המוצרים" : "All products";
  }

  function allProductsStatusLabel(status: "rented" | "available" | "pendingVerification" | "rejected") {
    if (language === "he") {
      if (status === "rented") return "מושכר";
      if (status === "available") return "זמין";
      if (status === "pendingVerification") return "ממתין לאימות";
      return "לא אומת";
    }
    return status;
  }

  function allProductsFilterLabel(filter: AllProductsLifecycleFilter) {
    if (language === "he") {
      if (filter === "all") return "הכל";
      if (filter === "available") return "זמין";
      return "מושכר";
    }
    return filter;
  }

  function allProductsVerificationFilterLabel(filter: AllProductsVerificationFilter) {
    if (language === "he") {
      if (filter === "all") return "הכל";
      if (filter === "approved") return "מאומת";
      if (filter === "rejected") return "לא אומת";
      return "ממתין לאימות";
    }
    return filter;
  }

  function sendMessageToRenterLabel(name: string) {
    if (language === "he") return `שלח הודעה ל${name}`;
    return `Message ${name}`;
  }

  function getDayOccupancy(day: Date, unitsTotal: number, ranges: CalendarRange[]) {
    let rentedUnits = 0;
    let blocked = false;
    for (const range of ranges) {
      if (!isWithinRange(day, range)) continue;
      if (range.kind === "manualUnavailable") blocked = true;
      rentedUnits = Math.max(rentedUnits, range.units);
    }
    const occupiedUnits = Math.min(unitsTotal, blocked ? unitsTotal : rentedUnits);
    const availableUnits = Math.max(0, unitsTotal - occupiedUnits);
    return { occupiedUnits, availableUnits };
  }

  function dayColorClass(occupiedUnits: number, unitsTotal: number) {
    if (occupiedUnits <= 0) return "bg-emerald-50 text-emerald-900";
    if (occupiedUnits >= unitsTotal) return "bg-red-50 text-red-900";
    return "bg-amber-50 text-amber-900";
  }

  function removeUnavailableRange(listingId: string, rangeId: string) {
    const current = readUnavailabilityByListing();
    const nextList = (current[listingId] ?? []).filter((range) => range.id !== rangeId);
    const next = { ...current, [listingId]: nextList };
    saveUnavailabilityByListing(next);
    setUnavailabilityBump((n) => n + 1);
  }

  function addUnavailableRange(listingId: string) {
    setRangeError(null);
    if (!rangeFrom) {
      setRangeError(language === "he" ? "יש לבחור תאריך התחלה וסיום." : "Please pick start and end dates.");
      return;
    }
    const resolvedTo = rangeTo || rangeFrom;
    if (rangeFrom > resolvedTo) {
      setRangeError(language === "he" ? "תאריך הסיום חייב להיות אחרי תאריך ההתחלה." : "End date must be after start date.");
      return;
    }
    const current = readUnavailabilityByListing();
    const nextItem: UnavailabilityRange = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: rangeFrom,
      to: resolvedTo,
    };
    const next = {
      ...current,
      [listingId]: [...(current[listingId] ?? []), nextItem],
    };
    saveUnavailabilityByListing(next);
    setRangeFrom("");
    setRangeTo("");
    setUnavailabilityBump((n) => n + 1);
  }

  function productAvailabilityHistoryLabel() {
    if (language === "he") return "זמינות והיסטוריית מוצר";
    if (language === "ar") return "السجل والتقويم";
    if (language === "ru") return "История и календарь";
    if (language === "fr") return "Historique et calendrier";
    return "History & calendar";
  }

  function productCalendarAvailabilityLabel() {
    if (language === "he") return "זמין";
    if (language === "ar") return "متاح";
    if (language === "ru") return "Свободно";
    if (language === "fr") return "Disponible";
    return "Available";
  }

  function productCalendarUnavailableLabel() {
    if (language === "he") return "אי זמינות";
    if (language === "ar") return "غير متاح";
    if (language === "ru") return "Недоступно";
    if (language === "fr") return "Indisponible";
    return "Unavailable";
  }

  function productCalendarFutureBookedLabel() {
    if (language === "he") return "השכרות עתידיות";
    if (language === "ar") return "حجوزات مستقبلية";
    if (language === "ru") return "Будущие брони";
    if (language === "fr") return "Réservations futures";
    return "Future bookings";
  }

  function productCalendarPastRentalsLabel() {
    if (language === "he") return "השכרות קודמות";
    if (language === "ar") return "إيجارات سابقة";
    if (language === "ru") return "Прошлые аренды";
    if (language === "fr") return "Locations passées";
    return "Past rentals";
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
          <DynamicBackLink className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end sm:self-auto" : "self-start sm:self-auto"}`} />
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
              aria-selected={ownerSub === "allProducts"}
              onClick={() => selectOwnerSub("allProducts")}
              className={`${tabButton} ${ownerSub === "allProducts" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {allProductsTabLabel()}
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
              aria-selected={ownerSub === "available"}
              onClick={() => selectOwnerSub("available")}
              className={`${tabButton} ${ownerSub === "available" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {t("myProductsOwnerAvailable")}
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
            <button
              type="button"
              role="tab"
              aria-selected={ownerSub === "verificationStatus"}
              onClick={() => selectOwnerSub("verificationStatus")}
              className={`${tabButton} ${ownerSub === "verificationStatus" ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              {verificationTabLabel()}
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

        {mainMode === "owner" && ownerSub === "allProducts" ? (
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm">
              {(["all", "available", "rented"] as AllProductsLifecycleFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAllProductsLifecycleFilter(filter)}
                  className={`min-h-[38px] rounded-xl px-4 text-sm font-semibold ${
                    allProductsLifecycleFilter === filter
                      ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {allProductsFilterLabel(filter)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm">
              {(["all", "approved", "rejected", "pending"] as AllProductsVerificationFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAllProductsVerificationFilter(filter)}
                  className={`min-h-[38px] rounded-xl px-4 text-sm font-semibold ${
                    allProductsVerificationFilter === filter
                      ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {allProductsVerificationFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

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
              const effectiveName = item.name;
              const effectivePricePerDay = item.pricePerDay;
              const effectiveUnitsRaw = item.unitsTotal;
              const verificationMeta = listingVerificationMeta[item.id] ?? DEMO_VERIFICATION_META_BY_LISTING_ID[item.id];
              const isUploadedItem = item.id.startsWith("upl-");
              const verificationStatus: "pending" | "approved" | "rejected" = verificationMeta?.status ?? (isUploadedItem ? "pending" : "approved");
              const verificationSubmittedAt = verificationMeta?.submittedAt ?? (isUploadedItem ? todayLabel() : item.publishedAt);
              const verificationApprovedAt = verificationMeta?.verifiedAt ?? (verificationStatus === "approved" ? item.publishedAt : undefined);
              const owner = isOwnerListing(item);
              const isVerificationTab = owner && ownerSub === "verificationStatus";
              const isAllProductsTab = owner && ownerSub === "allProducts";
              const ownerAvailable = owner && item.ownerSub === "available";
              const unitsTotal = Math.max(1, effectiveUnitsRaw ?? 1);
              const unavailableRanges = unavailabilityByListing[item.id] ?? [];
              const detailHref = item.detailHref ?? `/products/${item.id}`;
              const lid = listingCheckoutId(item);
              const isPrivateAwaiting = !owner && item.renterSub === "awaitingPayment" && item.checkoutHref?.includes("type=private");
              const isCompanyAwaiting = !owner && item.renterSub === "awaitingPayment" && item.checkoutHref?.includes("type=company");
              const productIdFromCheckout = item.checkoutHref?.match(/productId=([^&]+)/)?.[1];
              const companyIdFromCheckout = item.checkoutHref?.match(/companyId=([^&]+)/)?.[1];
              const allProductsStatus: "rented" | "available" | "pendingVerification" | "rejected" =
                verificationStatus === "rejected"
                  ? "rejected"
                  : verificationStatus === "pending"
                    ? "pendingVerification"
                    : item.ownerSub === "leasedOut" || item.ownerSub === "upcomingRental"
                      ? "rented"
                      : "available";
              const canManageInAllProducts =
                (allProductsStatus === "available" || allProductsStatus === "rejected") &&
                item.ownerSub === "available" &&
                !item.rentalRequest;
              const blockedReasonInAllProducts =
                allProductsStatus === "rented"
                  ? (language === "he" ? "לא ניתן לערוך/למחוק כי המוצר מושכר או שמור להשכרה עתידית." : "Cannot edit/delete while rented or reserved.")
                  : allProductsStatus === "pendingVerification"
                    ? (language === "he" ? "לא ניתן לערוך/למחוק עד לסיום האימות." : "Cannot edit/delete during verification.")
                    : item.rentalRequest
                        ? (language === "he" ? "לא ניתן לערוך/למחוק כי קיימת בקשת השכרה פעילה." : "Cannot edit/delete with active request.")
                        : null;

              if (isVerificationTab) {
                return (
                  <article
                    key={`${mainMode}-${item.id}-${owner ? item.ownerSub : item.renterSub}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${isRtl ? "text-right" : "text-left"}`}>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-zinc-900">{effectiveName}</p>
                        <p className="text-sm text-zinc-500">ID: {item.id}</p>
                        <p className="text-sm text-zinc-500">
                          {verificationSubmittedLabel()}: {verificationSubmittedAt}
                        </p>
                        {verificationStatus === "approved" ? (
                          <p className="text-sm text-zinc-500">
                            {verificationApprovedAtLabel()}: {verificationApprovedAt}
                          </p>
                        ) : null}
                        {verificationStatus === "rejected" ? (
                          <p className="text-sm text-zinc-500">
                            {verificationRejectedAtLabel()}: {verificationMeta?.rejectedAt ?? (language === "he" ? "לא צוין" : "Not specified")}
                          </p>
                        ) : null}
                        {verificationMeta?.rejectionReason ? (
                          <p className="text-sm text-amber-700">
                            {verificationReasonLabel()}: {verificationMeta.rejectionReason}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          verificationStatus === "approved"
                            ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
                            : verificationStatus === "rejected"
                              ? "bg-red-50 text-red-900 ring-1 ring-red-200/80"
                              : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
                        }`}
                      >
                        {verificationStatusLabel(verificationStatus)}
                      </span>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={`${mainMode}-${item.id}-${owner ? item.ownerSub : item.renterSub}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300"
                >
                  <div className="flex flex-col gap-5 p-4 sm:p-5 md:flex-row md:items-stretch md:gap-4">
                    <div className="mx-auto flex w-full max-w-[280px] shrink-0 items-end justify-end gap-2 md:mx-0 md:w-52" dir="ltr">
                      <Link
                        href={detailHref}
                        className={`relative block h-44 w-full overflow-hidden rounded-xl bg-zinc-100 ${
                          owner && item.rentalRequest ? "md:h-[208px]" : "md:h-40"
                        }`}
                      >
                        <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width:768px) 100vw, 208px" className="object-cover object-center" />
                      </Link>
                    </div>

                    <div className="min-w-0 flex-1 space-y-3 md:pe-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className={`min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                          <div className={`flex items-center gap-2 ${isRtl ? "justify-end" : ""}`}>
                            <Link href={detailHref} className="text-lg font-bold text-zinc-900 hover:underline sm:text-xl">
                            {effectiveName}
                            </Link>
                            {ownerAvailable ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCalendarFor(item.id);
                                  const d = new Date();
                                  setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                                }}
                                className="min-h-[30px] rounded-lg border border-zinc-300 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                              >
                                {productAvailabilityHistoryLabel()}
                              </button>
                            ) : null}
                          </div>
                          {owner ? <p className="mt-0.5 text-xs text-zinc-500">ID: {item.id}</p> : null}
                          {item.summaryLine ? <p className="mt-1 text-sm text-zinc-600">{item.summaryLine}</p> : null}
                          <p className="mt-1 text-base font-semibold text-zinc-900">
                            {formatCurrency(effectivePricePerDay)} <span className="text-sm font-medium text-zinc-500">{t("perDay")}</span>
                          </p>
                        </div>
                        {isAllProductsTab ? (
                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              allProductsStatus === "available"
                                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
                                : allProductsStatus === "pendingVerification"
                                  ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
                                  : allProductsStatus === "rejected"
                                    ? "bg-red-50 text-red-900 ring-1 ring-red-200/80"
                                    : "bg-sky-50 text-sky-900 ring-1 ring-sky-200/80"
                            }`}
                          >
                            {allProductsStatusLabel(allProductsStatus)}
                          </span>
                        ) : ownerAvailable ? (
                          <span className="inline-flex w-fit shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
                            {productCalendarAvailabilityLabel()}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass[item.statusKey] ?? "bg-zinc-100 text-zinc-800"}`}
                          >
                            {statusLabel(item.statusKey)}
                          </span>
                        )}
                      </div>

                      {item.rentalRequest && !isAllProductsTab ? (
                        <div
                          className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 ${
                            owner && item.rentalRequest ? "md:h-[208px]" : ""
                          } ${isRtl ? "text-right" : "text-left"}`}
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            {owner && item.ownerSub === "leasedOut"
                              ? (language === "he" ? "פרטי השכרה פעילה" : "Active rental details")
                              : t("myProductsRentalRequestBlockTitle")}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-800">
                            {owner && item.ownerSub === "rentalRequestsPending" ? (
                              <>
                                <span className="text-xs font-medium text-zinc-500">{language === "he" ? "דירוג שוכר" : "Renter rating"}</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
                                  <span aria-hidden>⭐</span>
                                  {item.rentalRequest.renterRating.toFixed(1)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-medium text-zinc-500">
                                  {owner && item.ownerSub === "leasedOut"
                                    ? (language === "he" ? "מושכר כרגע ל" : "Currently rented to")
                                    : (language === "he" ? "שוכר" : "Renter")}
                                </span>
                                <Link
                                  href="/profile"
                                  className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-50"
                                >
                                  {item.rentalRequest.renterName}
                                </Link>
                              </>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-zinc-700">
                            {owner && item.ownerSub === "leasedOut" ? (
                              <>
                                <span className="font-medium text-zinc-900">{language === "he" ? "חוזר בתאריך" : "Returns on"}:</span> {item.rentalRequest.dateToLabel}
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-zinc-900">{t("dateStartShort")}:</span> {item.rentalRequest.dateFromLabel}{" "}
                                <span className="mx-1 text-zinc-400">·</span>
                                <span className="font-medium text-zinc-900">{t("dateEndShort")}:</span> {item.rentalRequest.dateToLabel}
                              </>
                            )}
                          </p>
                          <ul className={`mt-2 list-inside text-sm text-zinc-700 ${isRtl ? "list-disc text-right" : "list-disc text-left"}`}>
                            {item.rentalRequest.productLines.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
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
                          ) : owner ? (
                            <div className={`mt-4 flex ${isRtl ? "justify-end" : "justify-start"}`}>
                              <div className={`flex flex-wrap items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                                <Link
                                  href="/messages"
                                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
                                >
                                  {sendMessageToRenterLabel(item.rentalRequest.renterName)}
                                </Link>
                                {item.ownerSub === "upcomingRental" ? (
                                  <button
                                    type="button"
                                    className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                                  >
                                    {language === "he" ? "אישור מסירה" : "Confirm handoff"}
                                  </button>
                                ) : null}
                                {item.ownerSub === "leasedOut" ? (
                                  <button
                                    type="button"
                                    className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                                  >
                                    {language === "he" ? "אישור קבלה" : "Confirm return received"}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {!(owner && item.rentalRequest && !isAllProductsTab) ? (
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
                          {ownerAvailable ? (
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                              <span>
                                <span className="block text-xs text-zinc-500">{unitsAvailableLabel()}</span>
                                <span className="block text-sm font-semibold text-zinc-900">{unitsTotal}</span>
                              </span>
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {ownerAvailable && unavailableRanges.length > 0 ? (
                        <div className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 ${isRtl ? "text-right" : "text-left"}`}>
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{productCalendarUnavailableLabel()}</p>
                          <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                            {unavailableRanges.map((range) => (
                              <li key={range.id} className="flex items-center justify-between gap-3">
                                <span>{formatDateRangeLabel(range.from, range.to)}</span>
                                <button
                                  type="button"
                                  onClick={() => removeUnavailableRange(item.id, range.id)}
                                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                                >
                                  {language === "he" ? "הסר" : "Remove"}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {owner && ownerSub === "verificationStatus" ? (
                        <div className={`rounded-xl border border-zinc-200 bg-zinc-50/90 p-3 ${isRtl ? "text-right" : "text-left"}`}>
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{verificationTabLabel()}</p>
                          <p className="mt-2 text-sm font-semibold text-zinc-900">{verificationStatusLabel(verificationStatus)}</p>
                          <p className="mt-1 text-sm text-zinc-700">{verificationSubmittedLabel()}: {verificationSubmittedAt}</p>
                          <p className="mt-1 text-sm text-zinc-700">
                            {verificationApprovedAtLabel()}: {verificationApprovedAt ?? (language === "he" ? "עדיין ממתין" : "Still pending")}
                          </p>
                        </div>
                      ) : null}
                      {isAllProductsTab && !canManageInAllProducts && blockedReasonInAllProducts ? (
                        <p className={`rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 ${isRtl ? "text-right" : "text-left"}`}>
                          {blockedReasonInAllProducts}
                        </p>
                      ) : null}

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

                      {owner && item.ownerSub === "rentalRequestsPending" && !isAllProductsTab ? null : (
                      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                        {!owner ? (
                          <button
                            type="button"
                            className="text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline"
                          >
                            {t("myProductsViewRental")}
                          </button>
                        ) : <span />}
                        <div
                          className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
                        >
                          {isAllProductsTab ? (
                            <>
                              <button
                                type="button"
                                disabled={!canManageInAllProducts}
                                onClick={() => {
                                  if (!canManageInAllProducts) return;
                                  if (allProductsStatus === "rejected") {
                                    setListingVerificationMeta((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        status: "pending",
                                        submittedAt: todayLabel(),
                                      },
                                    }));
                                  }
                                }}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                  canManageInAllProducts ? "bg-emerald-950 text-white hover:bg-emerald-900" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                }`}
                              >
                                {language === "he" ? "עריכה" : "Edit"}
                              </button>
                              <button
                                type="button"
                                disabled={!canManageInAllProducts}
                                onClick={() => {
                                  if (!canManageInAllProducts) return;
                                  setHiddenOwnerListingIds((prev) => [...prev, item.id]);
                                }}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                  canManageInAllProducts ? "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50" : "border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                                }`}
                              >
                                {language === "he" ? "מחיקה" : "Delete"}
                              </button>
                            </>
                          ) : null}
                          {!owner && item.primaryAction === "payNow" && item.checkoutHref ? (
                            <Link
                              href={item.checkoutHref}
                              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 sm:min-w-[200px]"
                            >
                              {primaryLabel(item.primaryAction)}
                            </Link>
                          ) : owner && (item.rentalRequest || isAllProductsTab) ? null : (
                            <button
                              type="button"
                              onClick={() => {
                                if (ownerAvailable) {
                                  setOpenUnavailabilityFor(item.id);
                                  const d = new Date();
                                  setUnavailabilityPickerMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                                  setRangeFrom("");
                                  setRangeTo("");
                                  setRangeError(null);
                                  return;
                                }
                              }}
                              className="min-h-[44px] rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 sm:min-w-[200px]"
                            >
                              {ownerAvailable ? formatUnavailabilityAction() : primaryLabel(item.primaryAction)}
                            </button>
                          )}
                        </div>
                      </div>
                      )}

                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {openUnavailabilityFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-zinc-900">{formatUnavailabilityAction()}</h3>
              <button
                type="button"
                onClick={() => setOpenUnavailabilityFor(null)}
                className="rounded-lg border border-zinc-200 px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                {language === "he" ? "סגור" : "Close"}
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              {language === "he"
                ? "אפשר להוסיף כמה טווחי תאריכים שונים לאי זמינות."
                : "You can add multiple unavailable date ranges."}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setUnavailabilityPickerMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {language === "he" ? "חודש קודם" : "Prev month"}
              </button>
              <p className="text-sm font-bold text-zinc-800">{monthLabel(unavailabilityPickerMonth)}</p>
              <button
                type="button"
                onClick={() => setUnavailabilityPickerMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {language === "he" ? "חודש הבא" : "Next month"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {(language === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((name) => (
                <div key={name} className="rounded-md bg-zinc-100 py-1 text-center text-xs font-semibold text-zinc-600">
                  {name}
                </div>
              ))}
            </div>
            <div className="mt-2 grid max-h-[42vh] grid-cols-7 gap-2 overflow-y-auto">
              {(() => {
                const monthStart = new Date(unavailabilityPickerMonth.getFullYear(), unavailabilityPickerMonth.getMonth(), 1);
                const monthEnd = new Date(unavailabilityPickerMonth.getFullYear(), unavailabilityPickerMonth.getMonth() + 1, 0);
                const gridStart = startOfWeek(monthStart);
                const gridEnd = endOfWeek(monthEnd);
                const days: Date[] = [];
                for (let day = new Date(gridStart); day <= gridEnd; day.setDate(day.getDate() + 1)) {
                  days.push(new Date(day));
                }
                return days.map((day) => {
                  const inMonth = day.getMonth() === unavailabilityPickerMonth.getMonth();
                  const iso = day.toISOString().slice(0, 10);
                  const selected =
                    rangeFrom && rangeTo
                      ? iso >= rangeFrom && iso <= rangeTo
                      : rangeFrom
                        ? iso === rangeFrom
                        : false;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setRangeError(null);
                        if (!rangeFrom || rangeTo) {
                          setRangeFrom(iso);
                          setRangeTo("");
                          return;
                        }
                        if (iso < rangeFrom) {
                          setRangeTo(rangeFrom);
                          setRangeFrom(iso);
                          return;
                        }
                        setRangeTo(iso);
                      }}
                      className={`min-h-[40px] rounded-lg border text-xs font-semibold transition ${
                        selected
                          ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                          : inMonth
                            ? "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                            : "border-zinc-200 bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                });
              })()}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {language === "he"
                ? `נבחר: ${rangeFrom || "-"} ${rangeTo ? `עד ${rangeTo}` : ""}`
                : `Selected: ${rangeFrom || "-"} ${rangeTo ? `to ${rangeTo}` : ""}`}
            </p>

            {rangeError ? <p className="mt-3 text-sm text-red-600">{rangeError}</p> : null}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => addUnavailableRange(openUnavailabilityFor)}
                className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                {language === "he" ? "הוספת טווח אי זמינות" : "Add range"}
              </button>
            </div>

            <ul className="mt-4 max-h-44 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              {(unavailabilityByListing[openUnavailabilityFor] ?? []).length === 0 ? (
                <li className="text-sm text-zinc-500">{language === "he" ? "עדיין לא הוגדרו טווחים." : "No ranges yet."}</li>
              ) : (
                (unavailabilityByListing[openUnavailabilityFor] ?? []).map((range) => (
                  <li key={range.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm text-zinc-700">
                    <span>{formatDateRangeLabel(range.from, range.to)}</span>
                    <button
                      type="button"
                      onClick={() => removeUnavailableRange(openUnavailabilityFor, range.id)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                    >
                      {language === "he" ? "מחיקה" : "Delete"}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}

      {openCalendarFor ? (
        (() => {
          const item = filtered.find((row) => row.id === openCalendarFor);
          if (!item) return null;
          const unitsTotal = Math.max(1, item.unitsTotal ?? 1);
          const unavailableRanges = unavailabilityByListing[item.id] ?? [];
          const calendarRanges = [
            ...buildSyntheticRentalRanges(item, unitsTotal),
            ...buildManualUnavailableRanges(unavailableRanges),
          ];
          const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
          const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
          const gridStart = startOfWeek(monthStart);
          const gridEnd = endOfWeek(monthEnd);
          const days: Date[] = [];
          for (let day = new Date(gridStart); day <= gridEnd; day.setDate(day.getDate() + 1)) {
            days.push(new Date(day));
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4">
              <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-6" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-bold text-zinc-900">{productAvailabilityHistoryLabel()} - {item.name}</p>
                    <p className="text-sm text-zinc-600">
                      {unitsAvailableLabel()}: <span className="font-semibold text-zinc-900">{unitsTotal}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenCalendarFor(null)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    {language === "he" ? "סגור" : "Close"}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    {language === "he" ? "חודש קודם" : "Prev month"}
                  </button>
                  <p className="text-sm font-bold text-zinc-800">{monthLabel(calendarMonth)}</p>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    {language === "he" ? "חודש הבא" : "Next month"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2">
                  {(language === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((name) => (
                    <div key={name} className="rounded-md bg-zinc-100 py-1 text-center text-xs font-semibold text-zinc-600">
                      {name}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid max-h-[60vh] grid-cols-7 gap-2 overflow-y-auto">
                  {days.map((day) => {
                    const inMonth = day.getMonth() === calendarMonth.getMonth();
                    const { occupiedUnits, availableUnits } = getDayOccupancy(day, unitsTotal, calendarRanges);
                    const baseColor = dayColorClass(occupiedUnits, unitsTotal);
                    const bgClass = inMonth ? baseColor : `${baseColor} opacity-70`;

                    return (
                      <div key={day.toISOString()} className={`min-h-[86px] rounded-lg border border-zinc-200 p-2 text-xs ${bgClass}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{day.getDate()}</span>
                          {sameDay(day, new Date()) ? <span className="rounded bg-white px-1 text-[10px] text-zinc-500">{language === "he" ? "היום" : "Today"}</span> : null}
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px]">{language === "he" ? `מושכר: ${occupiedUnits}` : `Rented: ${occupiedUnits}`}</p>
                          <p className="text-[11px]">{language === "he" ? `זמין: ${availableUnits}` : `Available: ${availableUnits}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-900">{language === "he" ? "הכל זמין" : "All available"}</span>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-900">{language === "he" ? "חלק מושכר" : "Partially rented"}</span>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-red-900">{language === "he" ? "הכל מושכר" : "Fully rented"}</span>
                </div>
              </div>
            </div>
          );
        })()
      ) : null}

    </main>
  );
}

export default function MyProductsTemplatePage() {
  return null;
}
