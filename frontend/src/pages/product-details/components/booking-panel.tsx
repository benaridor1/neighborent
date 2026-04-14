"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityRequestSentDialog } from "../../../components/availability-request-sent-dialog";
import { RentalDatesPickerModal } from "../../../components/rental-dates-picker-modal";
import { ProductDetailsItem } from "../types/product-details";
import { useLocale } from "../../../lib/locale-context";
import { appendPrivateAvailabilityRequest } from "../../../lib/renter-availability-requests";
import { formatRentalIsoForDisplay, readRentalBookingDates, RENTAL_BOOKING_DATES_EVENT } from "../../../lib/rental-booking-dates";
import { addToRentalCompanyCart, readRentalCompanyCart, RENTAL_CART_CHANGE_EVENT } from "../../../lib/rental-company-cart";

interface BookingPanelProps {
  product: ProductDetailsItem;
}

export function BookingPanel({ product }: BookingPanelProps) {
  const router = useRouter();
  const { formatCurrency, language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const rentalCompanyId = product.rentalCompanyId;
  const isRentalCatalog = Boolean(rentalCompanyId);

  const [qty, setQty] = useState(1);
  const [, setCartBump] = useState(0);
  const [availabilitySentOpen, setAvailabilitySentOpen] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [datesPickerOpen, setDatesPickerOpen] = useState(false);

  const refreshDatesFromStorage = useCallback(() => {
    const { startIso, endIso } = readRentalBookingDates();
    setDateStart(startIso ?? "");
    setDateEnd(endIso ?? "");
  }, []);

  useEffect(() => {
    if (isRentalCatalog) return;
    refreshDatesFromStorage();
    window.addEventListener(RENTAL_BOOKING_DATES_EVENT, refreshDatesFromStorage);
    return () => window.removeEventListener(RENTAL_BOOKING_DATES_EVENT, refreshDatesFromStorage);
  }, [isRentalCatalog, refreshDatesFromStorage]);

  useEffect(() => {
    if (!isRentalCatalog) return;
    const onChange = () => setCartBump((n) => n + 1);
    window.addEventListener(RENTAL_CART_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(RENTAL_CART_CHANGE_EVENT, onChange);
  }, [isRentalCatalog]);

  const inCart = !rentalCompanyId ? 0 : readRentalCompanyCart(rentalCompanyId)[product.id] ?? 0;

  const addRentalToCart = () => {
    if (!rentalCompanyId) return;
    addToRentalCompanyCart(rentalCompanyId, product.id, qty);
    setQty(1);
    router.push(`/rental-companies/${rentalCompanyId}`);
  };

  const submitPrivateAvailabilityCheck = () => {
    const imageUrl = product.images[0] ?? "";
    appendPrivateAvailabilityRequest({
      productId: product.id,
      productName: product.name,
      imageUrl,
      pricePerDay: product.pricePerDay,
    });
    setAvailabilitySentOpen(true);
  };

  return (
    <aside className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <p className="text-xl font-bold text-zinc-900">
        {formatCurrency(product.pricePerDay)} <span className="text-sm font-medium text-zinc-600">{t("perDay")}</span>
      </p>
      {isRentalCatalog ? (
        <div className="mt-4 space-y-3">
          <label className={`flex flex-col gap-1 ${isRtl ? "items-end" : "items-start"}`}>
            <span className="text-xs font-semibold text-zinc-600">{t("companyQuantity")}</span>
            <input
              type="number"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.min(99, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
              className="h-10 w-full max-w-[120px] rounded-lg border border-zinc-200 px-2 text-center text-sm outline-none focus:ring-2 focus:ring-emerald-950/15"
            />
          </label>
          <button type="button" onClick={addRentalToCart} className="w-full rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
            {t("companyAddToCart")}
          </button>
          {inCart > 0 ? (
            <p className="text-xs text-emerald-900">
              {t("companyInCart")}: {inCart}
            </p>
          ) : null}
        </div>
      ) : null}
      {!isRentalCatalog ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className={`flex flex-col gap-1 text-xs ${isRtl ? "items-end" : "items-start"}`}>
              <span className="font-semibold text-zinc-600">{t("dateStartShort")}</span>
              <button
                type="button"
                onClick={() => setDatesPickerOpen(true)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-2 text-start text-sm text-zinc-800 shadow-sm outline-none hover:border-emerald-900/30 hover:bg-zinc-50 focus:ring-2 focus:ring-emerald-950/15"
              >
                {formatRentalIsoForDisplay(dateStart || null, t("monthMay"), t("monthJune")) || t("chooseRentalDates")}
              </button>
            </div>
            <div className={`flex flex-col gap-1 text-xs ${isRtl ? "items-end" : "items-start"}`}>
              <span className="font-semibold text-zinc-600">{t("dateEndShort")}</span>
              <button
                type="button"
                onClick={() => setDatesPickerOpen(true)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-2 text-start text-sm text-zinc-800 shadow-sm outline-none hover:border-emerald-900/30 hover:bg-zinc-50 focus:ring-2 focus:ring-emerald-950/15"
              >
                {formatRentalIsoForDisplay(dateEnd || null, t("monthMay"), t("monthJune")) || t("chooseRentalDates")}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={submitPrivateAvailabilityCheck}
            className="mt-3 w-full rounded-lg bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            {t("checkAvailability")}
          </button>
        </>
      ) : null}
      {!isRentalCatalog ? <RentalDatesPickerModal open={datesPickerOpen} onClose={() => setDatesPickerOpen(false)} /> : null}
      <AvailabilityRequestSentDialog open={availabilitySentOpen} onClose={() => setAvailabilitySentOpen(false)} />
    </aside>
  );
}

export default function BookingPanelPage() {
  return null;
}
