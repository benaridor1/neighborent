"use client";

import { demoProductCardImage, type DemoCategoryKey } from "./demo-category-images";
import type { ListingConditionId } from "./catalog-search-constants";

const OWNER_LISTINGS_KEY = "rentup:owner-uploaded-listings-v1";
const OWNER_LISTINGS_CHANGED_EVENT = "rentup:owner-uploaded-listings-changed";

export interface UploadedOwnerListingRecord {
  id: string;
  name: string;
  imageUrl: string;
  pricePerDay: number;
  publishedAt: string;
  rentalsCount: number;
  unitsTotal: number;
  category: DemoCategoryKey;
  city?: string;
  condition?: ListingConditionId;
  deposit?: number;
  description?: string;
  imageFrontUrl?: string;
  imageBackUrl?: string;
  imageRightUrl?: string;
  imageLeftUrl?: string;
}

interface SaveUploadedOwnerListingInput {
  name: string;
  pricePerDay: number;
  unitsTotal: number;
  category: DemoCategoryKey;
  city?: string;
  condition?: ListingConditionId;
  deposit?: number;
  description?: string;
  imageFrontUrl?: string;
  imageBackUrl?: string;
  imageRightUrl?: string;
  imageLeftUrl?: string;
}

function safeParse(json: string | null): UploadedOwnerListingRecord[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object") as UploadedOwnerListingRecord[];
  } catch {
    return [];
  }
}

function formatDateLabel(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

function emitOwnerListingsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OWNER_LISTINGS_CHANGED_EVENT));
}

export function ownerUploadedListingsChangedEventName(): string {
  return OWNER_LISTINGS_CHANGED_EVENT;
}

export function listUploadedOwnerListings(): UploadedOwnerListingRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(OWNER_LISTINGS_KEY);
  return safeParse(raw);
}

export function saveUploadedOwnerListing(input: SaveUploadedOwnerListingInput): UploadedOwnerListingRecord {
  if (typeof window === "undefined") {
    return {
      id: "upl-temp",
      name: input.name,
      imageUrl: demoProductCardImage(input.category, "upl-temp"),
      pricePerDay: input.pricePerDay,
      publishedAt: formatDateLabel(new Date()),
      rentalsCount: 0,
      unitsTotal: input.unitsTotal,
      category: input.category,
      city: input.city,
      condition: input.condition,
      deposit: input.deposit,
      description: input.description,
      imageFrontUrl: input.imageFrontUrl,
      imageBackUrl: input.imageBackUrl,
      imageRightUrl: input.imageRightUrl,
      imageLeftUrl: input.imageLeftUrl,
    };
  }

  const current = listUploadedOwnerListings();
  const now = new Date();
  const id = `upl-${now.getTime()}`;
  const nextItem: UploadedOwnerListingRecord = {
    id,
    name: input.name,
    imageUrl: demoProductCardImage(input.category, id),
    pricePerDay: input.pricePerDay,
    publishedAt: formatDateLabel(now),
    rentalsCount: 0,
    unitsTotal: input.unitsTotal,
    category: input.category,
    city: input.city,
    condition: input.condition,
    deposit: input.deposit,
    description: input.description,
    imageFrontUrl: input.imageFrontUrl,
    imageBackUrl: input.imageBackUrl,
    imageRightUrl: input.imageRightUrl,
    imageLeftUrl: input.imageLeftUrl,
  };

  window.localStorage.setItem(OWNER_LISTINGS_KEY, JSON.stringify([nextItem, ...current]));
  emitOwnerListingsChanged();
  return nextItem;
}

export function removeUploadedOwnerListing(id: string): void {
  if (typeof window === "undefined") return;
  const current = listUploadedOwnerListings();
  const next = current.filter((item) => item.id !== id);
  if (next.length === current.length) return;
  window.localStorage.setItem(OWNER_LISTINGS_KEY, JSON.stringify(next));
  emitOwnerListingsChanged();
}
