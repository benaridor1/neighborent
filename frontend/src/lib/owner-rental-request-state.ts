/** Client-only: which owner-side rental requests were approved or declined in the demo. */

const APPROVED_KEY = "rentup:owner-approved-rental-request-ids";
const DECLINED_KEY = "rentup:owner-declined-rental-request-ids";

function readJsonIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeJsonIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
}

export function readApprovedOwnerRentalRequestIds(): string[] {
  return readJsonIds(APPROVED_KEY);
}

export function readDeclinedOwnerRentalRequestIds(): string[] {
  return readJsonIds(DECLINED_KEY);
}

export function approveOwnerRentalRequest(id: string): void {
  if (typeof window === "undefined") return;
  const approved = new Set(readApprovedOwnerRentalRequestIds());
  approved.add(id);
  writeJsonIds(APPROVED_KEY, [...approved]);
  const declined = readDeclinedOwnerRentalRequestIds().filter((x) => x !== id);
  writeJsonIds(DECLINED_KEY, declined);
  window.dispatchEvent(new Event("rentup:owner-rental-requests-changed"));
}

export function declineOwnerRentalRequest(id: string): void {
  if (typeof window === "undefined") return;
  const declined = new Set(readDeclinedOwnerRentalRequestIds());
  declined.add(id);
  writeJsonIds(DECLINED_KEY, [...declined]);
  const approved = readApprovedOwnerRentalRequestIds().filter((x) => x !== id);
  writeJsonIds(APPROVED_KEY, approved);
  window.dispatchEvent(new Event("rentup:owner-rental-requests-changed"));
}
