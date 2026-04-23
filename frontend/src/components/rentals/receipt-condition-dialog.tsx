"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../lib/locale-context";
import { confirmRenterReceipt } from "../../lib/renter-receipt-confirmation";

const PHOTO_SLOTS = ["front", "back", "right", "left"] as const;
type PhotoSlot = (typeof PHOTO_SLOTS)[number];

type ConditionChoice = "ok" | "defects";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  confirmKey: string;
  productTitle: string;
  onCompleted?: () => void;
};

export function ReceiptConditionDialog({ isOpen, onClose, confirmKey, productTitle, onCompleted = () => {} }: Props) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [previewUrls, setPreviewUrls] = useState<Record<PhotoSlot, string | null>>({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [hasFile, setHasFile] = useState<Record<PhotoSlot, boolean>>({
    front: false,
    back: false,
    right: false,
    left: false,
  });
  const [condition, setCondition] = useState<ConditionChoice>("ok");
  const [defectsNotes, setDefectsNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<PhotoSlot, HTMLInputElement | null>>({
    front: null,
    back: null,
    right: null,
    left: null,
  });

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const reset = useCallback(() => {
    setPreviewUrls((prev) => {
      PHOTO_SLOTS.forEach((s) => revokeUrl(prev[s]));
      return { front: null, back: null, right: null, left: null };
    });
    setHasFile({ front: false, back: false, right: false, left: false });
    setCondition("ok");
    setDefectsNotes("");
    setTermsAccepted(false);
    setError(null);
  }, [revokeUrl]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  function slotLabel(slot: PhotoSlot): string {
    if (slot === "front") return t("uploadSlotFront");
    if (slot === "back") return t("uploadSlotBack");
    if (slot === "right") return t("uploadSlotRight");
    return t("uploadSlotLeft");
  }

  function setSlotFile(slot: PhotoSlot, file: File | null) {
    setPreviewUrls((prev) => {
      revokeUrl(prev[slot]);
      const next = file ? URL.createObjectURL(file) : null;
      return { ...prev, [slot]: next };
    });
    setHasFile((prev) => ({ ...prev, [slot]: Boolean(file) }));
  }

  function handleSubmit() {
    const allSides = PHOTO_SLOTS.every((s) => hasFile[s]);
    if (!allSides) {
      setError(t("receiptConditionErrorPhotos"));
      return;
    }
    if (condition === "defects" && !defectsNotes.trim()) {
      setError(t("receiptConditionErrorDefects"));
      return;
    }
    if (!termsAccepted) {
      setError(t("receiptConditionErrorTerms"));
      return;
    }
    setError(null);
    confirmRenterReceipt(confirmKey);
    onCompleted();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-condition-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[min(92vh,900px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:p-6"
        dir={isRtl ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="receipt-condition-title" className={`text-lg font-bold text-zinc-900 sm:text-xl ${isRtl ? "text-right" : "text-left"}`}>
          {t("receiptConditionTitle")}
        </h2>
        <p className={`mt-1 text-sm text-zinc-600 ${isRtl ? "text-right" : "text-left"}`}>{productTitle}</p>
        <p className={`mt-3 text-sm text-zinc-700 ${isRtl ? "text-right" : "text-left"}`}>{t("receiptConditionPhotosHint")}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PHOTO_SLOTS.map((slot) => (
            <div key={slot} className="relative">
              <input
                ref={(el) => {
                  fileInputs.current[slot] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSlotFile(slot, file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputs.current[slot]?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 p-2 text-center transition hover:border-emerald-900/30 hover:bg-white"
              >
                {previewUrls[slot] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob preview
                  <img src={previewUrls[slot]!} alt="" className="h-24 w-full rounded-lg object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-zinc-400" aria-hidden />
                )}
                <span className="text-[11px] font-semibold leading-tight text-zinc-800">{slotLabel(slot)}</span>
              </button>
            </div>
          ))}
        </div>

        <fieldset className={`mt-6 space-y-3 ${isRtl ? "text-right" : "text-left"}`}>
          <legend className="text-sm font-semibold text-zinc-900">{t("receiptConditionStateLabel")}</legend>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="receipt-condition"
              checked={condition === "ok"}
              onChange={() => setCondition("ok")}
              className="mt-1"
            />
            <span className="text-sm text-zinc-800">{t("receiptConditionOk")}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="receipt-condition"
              checked={condition === "defects"}
              onChange={() => setCondition("defects")}
              className="mt-1"
            />
            <span className="text-sm text-zinc-800">{t("receiptConditionDefects")}</span>
          </label>
        </fieldset>

        {condition === "defects" ? (
          <div className="mt-3">
            <label className={`block text-sm font-semibold text-zinc-900 ${isRtl ? "text-right" : "text-left"}`} htmlFor="receipt-defects-notes">
              {t("receiptConditionDefectsDetails")}
            </label>
            <textarea
              id="receipt-defects-notes"
              value={defectsNotes}
              onChange={(e) => setDefectsNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder={t("receiptConditionDefectsPlaceholder")}
            />
          </div>
        ) : null}

        <label className={`mt-4 flex cursor-pointer items-start gap-2 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1" />
          <span className="text-sm text-zinc-800">
            {t("receiptConditionTermsPrefix")}{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-900 underline underline-offset-2">
              {t("menuTerms")}
            </Link>
          </span>
        </label>

        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className={`mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            {t("receiptConditionClose")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="min-h-[44px] rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
          >
            {t("receiptConditionSubmit")}
          </button>
        </div>
      </div>
    </div>
  );
}
