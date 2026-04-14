const CART_PREFIX = "rentup:rental-cart:";
export const RENTAL_CART_CHANGE_EVENT = "rentup-rental-cart-changed";

function key(companyId: string) {
  return `${CART_PREFIX}${companyId}`;
}

export function readRentalCompanyCart(companyId: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(key(companyId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = Math.min(999, Math.floor(n));
    }
    return out;
  } catch {
    return {};
  }
}

export function writeRentalCompanyCart(companyId: string, cart: Record<string, number>): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key(companyId), JSON.stringify(cart));
  window.dispatchEvent(new Event(RENTAL_CART_CHANGE_EVENT));
}

export function addToRentalCompanyCart(companyId: string, productId: string, qty: number): void {
  const q = Math.min(99, Math.max(1, Math.floor(qty) || 1));
  const cart = readRentalCompanyCart(companyId);
  cart[productId] = (cart[productId] ?? 0) + q;
  writeRentalCompanyCart(companyId, cart);
}

export function setRentalCartProductQty(companyId: string, productId: string, qty: number): void {
  const q = Math.floor(qty);
  const cart = readRentalCompanyCart(companyId);
  if (!Number.isFinite(q) || q <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = Math.min(999, Math.max(1, q));
  }
  writeRentalCompanyCart(companyId, cart);
}

export function removeRentalCartProduct(companyId: string, productId: string): void {
  const cart = readRentalCompanyCart(companyId);
  delete cart[productId];
  writeRentalCompanyCart(companyId, cart);
}
