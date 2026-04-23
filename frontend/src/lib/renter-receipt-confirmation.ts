/** Client-only: demo «אישור קבלה» (תקינות פריט) לצד השוכר */

const STORAGE_KEY = "rentup:renter-receipt-confirmed-ids";

export const RENTER_RECEIPT_CHANGED_EVENT = "rentup:renter-receipt-changed";

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

export function isRenterReceiptConfirmed(listingId: string): boolean {
  return readIds().includes(listingId);
}

export function confirmRenterReceipt(listingId: string): void {
  if (typeof window === "undefined") return;
  const next = new Set(readIds());
  next.add(listingId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  window.dispatchEvent(new Event(RENTER_RECEIPT_CHANGED_EVENT));
}
