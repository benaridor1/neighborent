import { LenderType } from "../types/home";
import { useLocale } from "../../../lib/locale-context";

interface LenderToggleProps {
  providerType: LenderType;
  onProviderChange: (value: LenderType) => void;
}

export function LenderToggle({ providerType, onProviderChange }: LenderToggleProps) {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";

  return (
    <div className="mx-auto inline-flex rounded-xl bg-amber-50 p-1" dir={isRtl ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => onProviderChange("private")}
        className={`rounded-lg px-10 py-2 text-sm font-bold ${providerType === "private" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-amber-200" : "text-zinc-700"}`}
      >
        {t("privateLender")}
      </button>
      <button
        type="button"
        onClick={() => onProviderChange("company")}
        className={`rounded-lg px-10 py-2 text-sm font-bold ${providerType === "company" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-amber-200" : "text-zinc-700"}`}
      >
        {t("rentalCompanies")}
      </button>
    </div>
  );
}

export default function LenderTogglePage() {
  return null;
}
