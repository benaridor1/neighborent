/** Client-only persistence for availability checks until a backend exists. */

import { demoCompanyCardImage, demoProductCardImage, inferDemoCategoryFromProductId } from "./demo-category-images";
import type { MyProductListing } from "./my-products.mock";

export const RENTER_AVAILABILITY_STORAGE_KEY = "rentup:renter-availability-requests";

export type RentAvailabilityPrivateRecord = {
  kind: "private";
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  pricePerDay: number;
  requestedAt: string;
};

export type RentAvailabilityCompanyRecord = {
  kind: "companyCart";
  id: string;
  companyId: string;
  companyName: string;
  summaryLines: string;
  totalPerDay: number;
  imageUrl: string;
  requestedAt: string;
};

export type RentAvailabilityRecord = RentAvailabilityPrivateRecord | RentAvailabilityCompanyRecord;

function readAll(): RentAvailabilityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RENTER_AVAILABILITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RentAvailabilityRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: RentAvailabilityRecord[]) {
  window.localStorage.setItem(RENTER_AVAILABILITY_STORAGE_KEY, JSON.stringify(records));
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function appendPrivateAvailabilityRequest(
  params: Omit<RentAvailabilityPrivateRecord, "kind" | "id" | "requestedAt"> & { requestedAt?: string },
): RentAvailabilityPrivateRecord {
  const record: RentAvailabilityPrivateRecord = {
    kind: "private",
    id: newId(),
    requestedAt: params.requestedAt ?? new Date().toISOString(),
    productId: params.productId,
    productName: params.productName,
    imageUrl: params.imageUrl,
    pricePerDay: params.pricePerDay,
  };
  writeAll([record, ...readAll()]);
  window.dispatchEvent(new Event("rentup:renter-availability-requests-changed"));
  return record;
}

export function appendCompanyCartAvailabilityRequest(
  params: Omit<RentAvailabilityCompanyRecord, "kind" | "id" | "requestedAt"> & { requestedAt?: string },
): RentAvailabilityCompanyRecord {
  const record: RentAvailabilityCompanyRecord = {
    kind: "companyCart",
    id: newId(),
    requestedAt: params.requestedAt ?? new Date().toISOString(),
    companyId: params.companyId,
    companyName: params.companyName,
    summaryLines: params.summaryLines,
    totalPerDay: params.totalPerDay,
    imageUrl: params.imageUrl,
  };
  writeAll([record, ...readAll()]);
  window.dispatchEvent(new Event("rentup:renter-availability-requests-changed"));
  return record;
}

export function listPendingAvailabilityRequests(): RentAvailabilityRecord[] {
  return readAll();
}

export function mapAvailabilityRecordToListing(record: RentAvailabilityRecord): MyProductListing {
  const publishedAt = record.requestedAt.slice(0, 10);
  if (record.kind === "private") {
    return {
      id: `stored-${record.id}`,
      name: record.productName,
      imageUrl:
        record.imageUrl ||
        demoProductCardImage(inferDemoCategoryFromProductId(record.productId), record.productId),
      pricePerDay: record.pricePerDay,
      renterSub: "pendingApproval",
      statusKey: "pending",
      publishedAt,
      rentalsCount: 0,
      primaryAction: "moreInfo",
      detailHref: `/products/${record.productId}`,
    };
  }
  return {
    id: `stored-${record.id}`,
    name: record.companyName,
    summaryLine: record.summaryLines,
    imageUrl: record.imageUrl || demoCompanyCardImage(record.companyId),
    pricePerDay: record.totalPerDay,
    renterSub: "pendingApproval",
    statusKey: "pending",
    publishedAt,
    rentalsCount: 0,
    primaryAction: "moreInfo",
    detailHref: `/rental-companies/${record.companyId}`,
  };
}
