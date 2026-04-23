/** Client-only: דמו — ביטול השכרה מ«שוכר בקרוב» (מוצר פגום) */

const STORAGE_KEY = "rentup:cancelled-mock-renting-soon-ids";

export const RENTER_RENTAL_CANCELLED_EVENT = "rentup:renter-rental-cancelled";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function readCancelledMockRentingSoonListingIds(): Set<string> {
  return new Set(readIds());
}

export function cancelMockRentingSoonListing(listingId: string): void {
  if (typeof window === "undefined") return;
  const next = new Set(readIds());
  next.add(listingId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  window.dispatchEvent(new Event(RENTER_RENTAL_CANCELLED_EVENT));
}
