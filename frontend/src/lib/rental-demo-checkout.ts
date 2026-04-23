/** Client-only: demo “paid” rentals after checkout so the renter UI can show lender contact + chat link. */

import { demoCompanyCardImage, demoProductCardImage, inferDemoCategoryFromProductId } from "./demo-category-images";
import { getProductDetails } from "../pages/product-details/data/product-details.mock";
import { getRentalCatalogItemById, getRentalCompanyById } from "./rental-company-catalog.mock";
import { readRentalCompanyCart } from "./rental-company-cart";

const STORAGE_KEY = "rentup:demo-post-checkout-records";

export type DemoPostCheckoutRecord = {
  recordId: string;
  listingId: string;
  kind: "private" | "company";
  productId?: string;
  companyId?: string;
  productTitle: string;
  imageUrl: string;
  pricePerDay: number;
  paidAt: string;
  lenderDisplayName: string;
  lenderPhone: string;
  lenderEmail: string;
  /** Path under /messages/:id */
  messagesThreadPath: string;
  /** Start of rental period (ISO); used to show row under «שוכר בקרוב» before period begins */
  rentalPeriodStartIso?: string;
  pickupWhenLabel?: string;
  pickupWhereLabel?: string;
};

export function parseDemoDateDdMmYyyy(label: string): Date | null {
  const parts = label.trim().split(".");
  if (parts.length !== 3) return null;
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12) return null;
  return new Date(y, m - 1, d);
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Rental day is strictly after today (local) — row belongs in «שוכר בקרוב». */
export function isDemoPostCheckoutRentingSoon(rec: DemoPostCheckoutRecord): boolean {
  if (!rec.rentalPeriodStartIso) return false;
  const start = new Date(rec.rentalPeriodStartIso);
  if (Number.isNaN(start.getTime())) return false;
  return startOfLocalDay(new Date()) < startOfLocalDay(start);
}

function readAll(): DemoPostCheckoutRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DemoPostCheckoutRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: DemoPostCheckoutRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function newRecordId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `pay-${Date.now()}`;
}

function demoLenderForPrivate(productId: string, language: string): {
  lenderDisplayName: string;
  lenderPhone: string;
  lenderEmail: string;
  messagesThreadPath: string;
} {
  void language;
  void productId;
  return {
    lenderDisplayName: "Tomer Tenenbaum",
    lenderPhone: "+972-52-555-0142",
    lenderEmail: "tomer.demo@rentup.local",
    messagesThreadPath: "t1",
  };
}

function demoLenderForCompany(companyId: string, language: string): {
  lenderDisplayName: string;
  lenderPhone: string;
  lenderEmail: string;
  messagesThreadPath: string;
} {
  void language;
  const c = getRentalCompanyById(companyId);
  return {
    lenderDisplayName: c?.category ?? "Rental company",
    lenderPhone: "+972-52-555-0199",
    lenderEmail: `orders-${companyId}@rentup.local`,
    messagesThreadPath: "t2",
  };
}

export function listDemoPostCheckoutRecords(): DemoPostCheckoutRecord[] {
  return readAll();
}

export function removeDemoPostCheckoutRecord(recordId: string): void {
  if (typeof window === "undefined") return;
  const next = readAll().filter((r) => r.recordId !== recordId);
  writeAll(next);
  window.dispatchEvent(new Event("rentup:demo-post-checkout-changed"));
}

export function isDemoListingPaid(listingId: string): boolean {
  return readAll().some((r) => r.listingId === listingId);
}

export function appendDemoPostCheckoutRecord(
  params: {
    listingId: string;
    kind: "private" | "company";
    productId?: string;
    companyId?: string;
    language: string;
    rentalPeriodStartIso?: string;
    pickupWhenLabel?: string;
    pickupWhereLabel?: string;
  },
): DemoPostCheckoutRecord {
  if (typeof window === "undefined") {
    throw new Error("appendDemoPostCheckoutRecord is client-only");
  }
  const { listingId, kind, productId, companyId, language, rentalPeriodStartIso, pickupWhenLabel, pickupWhereLabel } = params;
  let productTitle = "";
  let imageUrl = "";
  let pricePerDay = 0;
  let lender: ReturnType<typeof demoLenderForPrivate>;

  if (kind === "private" && productId) {
    const p = getProductDetails(productId, language);
    productTitle = p.name;
    imageUrl = p.images[0] ?? demoProductCardImage(inferDemoCategoryFromProductId(productId), productId);
    pricePerDay = p.pricePerDay;
    lender = demoLenderForPrivate(productId, language);
  } else if (kind === "company" && companyId) {
    const company = getRentalCompanyById(companyId);
    productTitle = company?.category ?? "Company cart";
    imageUrl = demoCompanyCardImage(companyId);
    const cart = readRentalCompanyCart(companyId);
    let cartTotal = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const line = getRentalCatalogItemById(id);
      if (line && qty > 0) cartTotal += line.pricePerDay * qty;
    }
    pricePerDay = cartTotal > 0 ? cartTotal : 420;
    lender = demoLenderForCompany(companyId, language);
  } else {
    productTitle = "Rental";
    imageUrl = demoProductCardImage("photo", listingId);
    pricePerDay = 0;
    lender = demoLenderForPrivate("p1", language);
  }

  const record: DemoPostCheckoutRecord = {
    recordId: newRecordId(),
    listingId,
    kind,
    productId,
    companyId,
    productTitle,
    imageUrl,
    pricePerDay,
    paidAt: new Date().toISOString(),
    ...lender,
    rentalPeriodStartIso,
    pickupWhenLabel,
    pickupWhereLabel,
  };
  writeAll([record, ...readAll()]);
  window.dispatchEvent(new Event("rentup:demo-post-checkout-changed"));
  return record;
}
