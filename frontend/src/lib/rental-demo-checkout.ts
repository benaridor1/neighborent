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
};

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
  },
): DemoPostCheckoutRecord {
  if (typeof window === "undefined") {
    throw new Error("appendDemoPostCheckoutRecord is client-only");
  }
  const { listingId, kind, productId, companyId, language } = params;
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
  };
  writeAll([record, ...readAll()]);
  window.dispatchEvent(new Event("rentup:demo-post-checkout-changed"));
  return record;
}
