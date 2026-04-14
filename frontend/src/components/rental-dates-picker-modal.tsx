"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "../lib/locale-context";
import {
  isoToRentalCalendarDate,
  readRentalBookingDates,
  rentalCalendarToIso,
  writeRentalBookingDates,
  type RentalCalendarDate,
} from "../lib/rental-booking-dates";
import { RentalDatesCalendar } from "./rental-dates-calendar";

interface RentalDatesPickerModalProps {
  open: boolean;
  onClose: () => void;
}

function toNumericDate(date: RentalCalendarDate) {
  return date.month * 100 + date.day;
}

export function RentalDatesPickerModal({ open, onClose }: RentalDatesPickerModalProps) {
  const { t } = useLocale();
  const [rentalStartDate, setRentalStartDate] = useState<RentalCalendarDate | null>(null);
  const [rentalEndDate, setRentalEndDate] = useState<RentalCalendarDate | null>(null);

  useEffect(() => {
    if (!open) return;
    const { startIso, endIso } = readRentalBookingDates();
    setRentalStartDate(startIso ? isoToRentalCalendarDate(startIso) : null);
    setRentalEndDate(endIso ? isoToRentalCalendarDate(endIso) : null);
  }, [open]);

  const onSelectDay = (month: 5 | 6, day: number) => {
    const clickedDate: RentalCalendarDate = { month, day };

    if (rentalStartDate === null || (rentalStartDate !== null && rentalEndDate !== null)) {
      setRentalStartDate(clickedDate);
      setRentalEndDate(null);
      return;
    }

    if (toNumericDate(clickedDate) <= toNumericDate(rentalStartDate)) {
      setRentalStartDate(clickedDate);
      setRentalEndDate(null);
      return;
    }

    setRentalEndDate(clickedDate);
  };

  const onApprove = () => {
    writeRentalBookingDates({
      startIso: rentalStartDate ? rentalCalendarToIso(rentalStartDate) : null,
      endIso: rentalEndDate ? rentalCalendarToIso(rentalEndDate) : null,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label={t("close")} onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">{t("chooseRentalDates")}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100">
            <X size={16} />
          </button>
        </div>
        <RentalDatesCalendar rentalStartDate={rentalStartDate} rentalEndDate={rentalEndDate} onSelectDay={onSelectDay} />
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onApprove} className="rounded-xl bg-emerald-950 px-5 py-2 text-sm font-semibold text-white">
            {t("approveDates")}
          </button>
        </div>
      </div>
    </div>
  );
}
