import { LenderType } from "../types/home";

interface LenderToggleProps {
  providerType: LenderType;
  onProviderChange: (value: LenderType) => void;
}

export function LenderToggle({ providerType, onProviderChange }: LenderToggleProps) {
  return (
    <div className="mx-auto inline-flex rounded-xl bg-amber-50 p-1" dir="rtl">
      <button
        type="button"
        onClick={() => onProviderChange("company")}
        className={`rounded-lg px-10 py-2 text-sm font-bold ${providerType === "company" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-amber-200" : "text-zinc-700"}`}
      >
        חברת השכרה
      </button>
      <button
        type="button"
        onClick={() => onProviderChange("private")}
        className={`rounded-lg px-10 py-2 text-sm font-bold ${providerType === "private" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-amber-200" : "text-zinc-700"}`}
      >
        משכיר פרטי
      </button>
    </div>
  );
}

export default function LenderTogglePage() {
  return null;
}
