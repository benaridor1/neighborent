const STORAGE_KEY = "rentup:rental-dates";
export const RENTAL_BOOKING_DATES_EVENT = "rentup-rental-dates-changed";

export interface RentalBookingDates {
  startIso: string | null;
  endIso: string | null;
}

export type RentalCalendarDate = { month: 5 | 6; day: number };

export function rentalCalendarToIso(d: RentalCalendarDate): string {
  const mon = d.month === 5 ? "05" : "06";
  return `2026-${mon}-${String(d.day).padStart(2, "0")}`;
}

export function isoToRentalCalendarDate(iso: string): RentalCalendarDate | null {
  const m = iso.match(/^2026-(05|06)-(\d{1,2})$/);
  if (!m) return null;
  const month = (m[1] === "05" ? 5 : 6) as 5 | 6;
  const day = parseInt(m[2], 10);
  if (!Number.isFinite(day) || day < 1) return null;
  if (month === 5 && day > 31) return null;
  if (month === 6 && day > 30) return null;
  return { month, day };
}

export function readRentalBookingDates(): RentalBookingDates {
  if (typeof window === "undefined") return { startIso: null, endIso: null };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { startIso: null, endIso: null };
    const p = JSON.parse(raw) as { startIso?: unknown; endIso?: unknown };
    const startIso = typeof p.startIso === "string" ? p.startIso : null;
    const endIso = typeof p.endIso === "string" ? p.endIso : null;
    return { startIso, endIso };
  } catch {
    return { startIso: null, endIso: null };
  }
}

export function writeRentalBookingDates(next: RentalBookingDates): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(RENTAL_BOOKING_DATES_EVENT));
}

/** Human label for a stored ISO date (May/June 2026 calendar). */
export function formatRentalIsoForDisplay(iso: string | null, monthMayLabel: string, monthJuneLabel: string): string {
  if (!iso) return "";
  const d = isoToRentalCalendarDate(iso);
  if (!d) return "";
  return `${d.day} ${d.month === 5 ? monthMayLabel : monthJuneLabel} 2026`;
}
