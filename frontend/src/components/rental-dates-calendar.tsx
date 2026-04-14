"use client";

import { useMemo } from "react";
import { useLocale } from "../lib/locale-context";
import type { RentalCalendarDate } from "../lib/rental-booking-dates";

const daysByLanguage: Record<string, string[]> = {
  he: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
  ar: ["ح", "ن", "ث", "ر", "خ", "ج", "س"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
};

function toNumericDate(date: RentalCalendarDate) {
  return date.month * 100 + date.day;
}

interface RentalDatesCalendarProps {
  rentalStartDate: RentalCalendarDate | null;
  rentalEndDate: RentalCalendarDate | null;
  onSelectDay: (month: 5 | 6, day: number) => void;
}

export function RentalDatesCalendar({ rentalStartDate, rentalEndDate, onSelectDay }: RentalDatesCalendarProps) {
  const { language, t } = useLocale();
  const days = useMemo(() => daysByLanguage[language] ?? daysByLanguage.en, [language]);

  const isDaySelected = (month: 5 | 6, day: number) => {
    const currentDate: RentalCalendarDate = { month, day };
    if (rentalStartDate === null) return false;
    const currentNumeric = toNumericDate(currentDate);
    const startNumeric = toNumericDate(rentalStartDate);
    if (rentalEndDate === null) return currentNumeric === startNumeric;
    const endNumeric = toNumericDate(rentalEndDate);
    return currentNumeric >= startNumeric && currentNumeric <= endNumeric;
  };

  const formatDate = (date: RentalCalendarDate) => `${date.day} ${date.month === 5 ? t("monthMay") : t("monthJune")} 2026`;

  return (
    <div className="rounded-2xl border border-zinc-100 p-4">
      <div className="mb-4 grid grid-cols-2 gap-6 text-center">
        <div>
          <p className="mb-2 font-bold text-zinc-900">
            {t("monthMay")} 2026
          </p>
          <div className="grid grid-cols-7 gap-2 text-xs text-zinc-700">
            {days.map((day) => (
              <span key={`m1-${day}`} className="py-1">
                {day}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <button
                key={`m1d-${d}`}
                type="button"
                onClick={() => onSelectDay(5, d)}
                className={`rounded-lg py-1 hover:bg-zinc-100 ${isDaySelected(5, d) ? "bg-emerald-950 font-bold text-white hover:bg-emerald-900" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-bold text-zinc-900">
            {t("monthJune")} 2026
          </p>
          <div className="grid grid-cols-7 gap-2 text-xs text-zinc-700">
            {days.map((day) => (
              <span key={`m2-${day}`} className="py-1">
                {day}
              </span>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <button
                key={`m2d-${d}`}
                type="button"
                onClick={() => onSelectDay(6, d)}
                className={`rounded-lg py-1 hover:bg-zinc-100 ${isDaySelected(6, d) ? "bg-emerald-950 font-bold text-white hover:bg-emerald-900" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-zinc-200 px-4 py-2 text-sm">
          {t("dateStart")} {rentalStartDate ? `- ${formatDate(rentalStartDate)}` : ""}
        </div>
        <div className="rounded-xl border border-zinc-200 px-4 py-2 text-sm">
          {t("dateEnd")} {rentalEndDate ? `- ${formatDate(rentalEndDate)}` : ""}
        </div>
      </div>
    </div>
  );
}
