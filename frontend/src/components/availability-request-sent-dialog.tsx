"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "../lib/locale-context";

interface AvailabilityRequestSentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AvailabilityRequestSentDialog({ open, onClose }: AvailabilityRequestSentDialogProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="availability-sent-title">
      <button type="button" className="absolute inset-0 bg-black/45" onClick={onClose} aria-label={t("close")} />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl ${isRtl ? "text-right" : "text-left"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 ${isRtl ? "start-4" : "end-4"}`}
          aria-label={t("close")}
        >
          <X size={18} />
        </button>
        <h2 id="availability-sent-title" className="pr-10 text-xl font-black text-zinc-900">
          {t("availabilityRequestSentTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">{t("availabilityRequestSentDescription")}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            {t("availabilityGoToHome")}
          </Link>
          <Link
            href="/my-products?mode=renter&renterSub=pendingApproval"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
          >
            {t("availabilityGoToMyRentals")}
          </Link>
        </div>
      </div>
    </div>
  );
}
