"use client";

import { useState } from "react";
import { useLocale } from "../lib/locale-context";
import { appendDemoPostCheckoutRecord, type DemoPostCheckoutRecord } from "../lib/rental-demo-checkout";
import { Input } from "./ui/input";

type Props = {
  listingId: string;
  kind: "private" | "company";
  productId?: string;
  companyId?: string;
  rentalPeriodStartIso?: string;
  pickupWhenLabel?: string;
  pickupWhereLabel?: string;
  onSuccess: (record: DemoPostCheckoutRecord) => void;
};

export function DemoRentalPaymentForm({
  listingId,
  kind,
  productId,
  companyId,
  rentalPeriodStartIso,
  pickupWhenLabel,
  pickupWhereLabel,
  onSuccess,
}: Props) {
  const { language, t } = useLocale();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handlePay() {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 12) {
      setError(t("checkoutCardErrorNumber"));
      return;
    }
    if (!cardName.trim()) {
      setError(t("checkoutCardErrorName"));
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
      setError(t("checkoutCardErrorExpiry"));
      return;
    }
    if (!/^\d{3,4}$/.test(cvv.trim())) {
      setError(t("checkoutCardErrorCvv"));
      return;
    }
    setError(null);
    const record = appendDemoPostCheckoutRecord({
      listingId,
      kind,
      productId,
      companyId,
      language,
      rentalPeriodStartIso,
      pickupWhenLabel,
      pickupWhereLabel,
    });
    onSuccess(record);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-zinc-600">{t("checkoutCardNumber")}</label>
          <Input
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-zinc-600">{t("checkoutCardHolder")}</label>
          <Input autoComplete="cc-name" placeholder={t("checkoutCardHolderPlaceholder")} value={cardName} onChange={(e) => setCardName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600">{t("checkoutCardExpiry")}</label>
          <Input inputMode="numeric" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600">{t("checkoutCardCvv")}</label>
          <Input inputMode="numeric" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
        </div>
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={handlePay}
        className="w-full rounded-xl bg-emerald-950 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
      >
        {t("checkoutPayDemoSubmit")}
      </button>
      <p className="text-xs text-zinc-500">{t("checkoutCardDemoHint")}</p>
    </div>
  );
}
