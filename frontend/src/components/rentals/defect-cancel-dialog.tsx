"use client";

import { useEffect, useState } from "react";
import { useLocale } from "../../lib/locale-context";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  onConfirmCancel: (reason: string) => void;
};

export function DefectCancelDialog({ isOpen, onClose, productTitle, onConfirmCancel }: Props) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="defect-cancel-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:p-6"
        dir={isRtl ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="defect-cancel-title" className={`text-lg font-bold text-zinc-900 ${isRtl ? "text-right" : "text-left"}`}>
          {t("defectReportTitle")}
        </h2>
        <p className={`mt-1 text-sm text-zinc-600 ${isRtl ? "text-right" : "text-left"}`}>{productTitle}</p>
        <p className={`mt-3 text-sm leading-relaxed text-zinc-700 ${isRtl ? "text-right" : "text-left"}`}>{t("defectReportDescription")}</p>
        <label className={`mt-4 block ${isRtl ? "text-right" : "text-left"}`} htmlFor="defect-reason">
          <span className="text-sm font-semibold text-zinc-900">{t("defectReportReasonLabel")}</span>
          <textarea
            id="defect-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
            placeholder={t("defectReportReasonPlaceholder")}
          />
        </label>
        <p className={`mt-2 text-xs text-zinc-500 ${isRtl ? "text-right" : "text-left"}`}>{t("defectReportDemoNote")}</p>
        <div className={`mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            {t("defectReportBack")}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCancel(reason.trim());
              onClose();
            }}
            className="min-h-[44px] rounded-xl bg-red-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          >
            {t("defectReportConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
