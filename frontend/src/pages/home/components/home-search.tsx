import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "../../../lib/locale-context";
import { EQUIPMENT_CONDITION_FILTER_IDS, SEARCH_CATEGORY_IDS, SEARCH_CATEGORY_LABEL_KEYS } from "../../../lib/catalog-search-constants";
import { getCityOptionsForLanguage } from "../../../lib/geo-search-options";
import { rentalCalendarToIso, writeRentalBookingDates, type RentalCalendarDate } from "../../../lib/rental-booking-dates";
import { RentalDatesCalendar } from "../../../components/rental-dates-calendar";

type SearchPanel = "location" | "dates" | "query" | "filters" | null;
type RentalDate = RentalCalendarDate;

type CityChoice = { mode: "region" } | { mode: "list"; index: number };
const PRICE_MIN = 1;
const PRICE_MAX = 2200;

const lenderRatings = ["all", "4.0+", "4.5+", "4.8+"];
const priceHistogram = [2, 3, 4, 3, 5, 4, 6, 8, 9, 12, 14, 16, 13, 18, 20, 17, 14, 10, 8, 6, 4, 3, 2];

interface HomeSearchFilters {
  minPrice: number;
  maxPrice: number;
  equipmentCondition: string;
  lenderRating: string;
}

interface HomeSearchPayload {
  city: string;
  searchText: string;
  category: string;
  dates: string;
  filters: HomeSearchFilters;
}

interface HomeSearchProps {
  onSearch: (payload: HomeSearchPayload) => void;
}

export function HomeSearch({ onSearch }: HomeSearchProps) {
  const { language, currency, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [activePanel, setActivePanel] = useState<SearchPanel>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [cityChoice, setCityChoice] = useState<CityChoice>({ mode: "region" });
  const [selectedDates, setSelectedDates] = useState(t("chooseRentalDates"));
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rentalStartDate, setRentalStartDate] = useState<RentalDate | null>(null);
  const [rentalEndDate, setRentalEndDate] = useState<RentalDate | null>(null);
  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [equipmentCondition, setEquipmentCondition] = useState<(typeof EQUIPMENT_CONDITION_FILTER_IDS)[number]>("all");
  const [lenderRating, setLenderRating] = useState("all");
  const priceTrackRef = useRef<HTMLDivElement | null>(null);
  const prevLanguageRef = useRef<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const cityOptions = useMemo(() => getCityOptionsForLanguage(language), [language]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return cityOptions;
    return cityOptions.filter((city) => city.toLowerCase().includes(cityQuery.trim().toLowerCase()));
  }, [cityOptions, cityQuery]);

  const selectedCity = useMemo(() => {
    if (cityChoice.mode === "region") return t("locationTelAvivCenter");
    const idx = cityChoice.index;
    if (idx < 0 || idx >= cityOptions.length) return t("locationTelAvivCenter");
    return cityOptions[idx];
  }, [cityChoice, cityOptions, t]);

  useEffect(() => {
    if (cityChoice.mode === "list" && cityChoice.index >= cityOptions.length) {
      setCityChoice({ mode: "region" });
    }
  }, [cityChoice, cityOptions.length]);

  const formatDate = useCallback(
    (date: RentalDate) => `${date.day} ${date.month === 5 ? t("monthMay") : t("monthJune")} 2026`,
    [t],
  );

  useEffect(() => {
    if (prevLanguageRef.current === null) {
      prevLanguageRef.current = language;
      return;
    }
    if (prevLanguageRef.current === language) return;
    prevLanguageRef.current = language;

    if (rentalStartDate !== null && rentalEndDate !== null) {
      setSelectedDates(`${formatDate(rentalStartDate)} - ${formatDate(rentalEndDate)}`);
      return;
    }
    if (rentalStartDate !== null) {
      setSelectedDates(formatDate(rentalStartDate));
      return;
    }
    setSelectedDates(t("chooseRentalDates"));
  }, [language, rentalStartDate, rentalEndDate, formatDate, t]);

  const togglePanel = (panel: SearchPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const closePanel = () => setActivePanel(null);

  const toNumericDate = (date: RentalDate) => date.month * 100 + date.day;

  const onSelectDay = (month: 5 | 6, day: number) => {
    const clickedDate: RentalDate = { month, day };

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

  const rangePercentMin = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rangePercentMax = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rangePercentMinRtl = 100 - rangePercentMin;
  const rangePercentMaxRtl = 100 - rangePercentMax;

  const isBarInSelectedRange = (index: number) => {
    const barPrice = PRICE_MIN + (index / (priceHistogram.length - 1)) * (PRICE_MAX - PRICE_MIN);
    return barPrice >= minPrice && barPrice <= maxPrice;
  };

  const updatePriceFromClientX = (clientX: number, handle: "min" | "max") => {
    const track = priceTrackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clampedX = Math.min(Math.max(clientX, rect.left), rect.right);
    const ratioLtr = (clampedX - rect.left) / rect.width;
    const ratioRtl = 1 - ratioLtr;
    const rawValue = PRICE_MIN + ratioRtl * (PRICE_MAX - PRICE_MIN);
    const nextValue = Math.round(rawValue);

    if (handle === "min") {
      setMinPrice(Math.min(nextValue, maxPrice));
      return;
    }

    setMaxPrice(Math.max(nextValue, minPrice));
  };

  const onMinPriceInput = (rawValue: string) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, PRICE_MIN), maxPrice);
    setMinPrice(clamped);
  };

  const onMaxPriceInput = (rawValue: string) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(Math.min(parsed, PRICE_MAX), minPrice);
    setMaxPrice(clamped);
  };

  const startHandleDrag = (handle: "min" | "max") => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const onMove = (moveEvent: PointerEvent) => updatePriceFromClientX(moveEvent.clientX, handle);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const submitSearch = () => {
    setHasSearched(true);
    if (rentalStartDate) {
      writeRentalBookingDates({
        startIso: rentalCalendarToIso(rentalStartDate),
        endIso: rentalEndDate ? rentalCalendarToIso(rentalEndDate) : null,
      });
    }
    onSearch({
      city: selectedCity,
      searchText,
      category: selectedCategory,
      dates: selectedDates,
      filters: {
        minPrice,
        maxPrice,
        equipmentCondition,
        lenderRating,
      },
    });
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-3" dir={isRtl ? "rtl" : "ltr"}>
      <div className="rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-1 md:grid-cols-[1fr_1fr_1fr_auto]">
          <button type="button" onClick={() => togglePanel("location")} className="rounded-full px-5 py-2 text-start hover:bg-zinc-50">
            <p className="text-xs font-bold text-zinc-900">{t("where")}</p>
            <p className="text-xs text-zinc-500">{selectedCity}</p>
          </button>
          <button type="button" onClick={() => togglePanel("dates")} className="rounded-full px-5 py-2 text-start hover:bg-zinc-50">
            <p className="text-xs font-bold text-zinc-900">{t("when")}</p>
            <p className="text-xs text-zinc-500">{selectedDates}</p>
          </button>
          <button type="button" onClick={() => togglePanel("query")} className="rounded-full px-5 py-2 text-start hover:bg-zinc-50">
            <p className="text-xs font-bold text-zinc-900">{t("whatLookingFor")}</p>
            <p className="text-xs text-zinc-500">{searchText || t("productOrModelPlaceholder")}</p>
          </button>
          <div className="flex items-center justify-center gap-2 px-1.5">
            <button type="button" onClick={submitSearch} className="rounded-full bg-emerald-950 p-3 text-white">
              <Search size={15} />
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={() => togglePanel("filters")}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-800"
              >
                <SlidersHorizontal size={13} />
                {t("filters")}
              </button>
            )}
          </div>
        </div>
      </div>

      {activePanel === "location" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">{t("citiesInIsrael")}</h3>
            <button type="button" onClick={closePanel} className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div className="relative">
            <input
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder={t("searchCityPlaceholder")}
              className="h-11 w-full rounded-xl border border-zinc-200 px-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          </div>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-zinc-100 p-2">
            {filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  const idx = cityOptions.indexOf(city);
                  if (idx >= 0) setCityChoice({ mode: "list", index: idx });
                  closePanel();
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <ChevronDown size={14} className="rotate-90 text-zinc-400" />
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {activePanel === "dates" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">{t("chooseRentalDates")}</h3>
            <button type="button" onClick={closePanel} className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <RentalDatesCalendar rentalStartDate={rentalStartDate} rentalEndDate={rentalEndDate} onSelectDay={onSelectDay} />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (rentalStartDate !== null && rentalEndDate !== null) {
                  setSelectedDates(`${formatDate(rentalStartDate)} - ${formatDate(rentalEndDate)}`);
                } else if (rentalStartDate !== null) {
                  setSelectedDates(formatDate(rentalStartDate));
                } else {
                  setSelectedDates(t("chooseRentalDates"));
                }
                writeRentalBookingDates({
                  startIso: rentalStartDate ? rentalCalendarToIso(rentalStartDate) : null,
                  endIso: rentalEndDate ? rentalCalendarToIso(rentalEndDate) : null,
                });
                closePanel();
              }}
              className="rounded-xl bg-emerald-950 px-5 py-2 text-sm font-semibold text-white"
            >
              {t("approveDates")}
            </button>
          </div>
        </div>
      )}

      {activePanel === "query" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">{t("searchAndRent")}</h3>
            <button type="button" onClick={closePanel} className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t("productOrModelPlaceholder")}
              className="h-11 rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200 md:col-span-2"
            />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="all">{t("all")}</option>
              {SEARCH_CATEGORY_IDS.map((category) => (
                <option key={category} value={category}>
                  {t(SEARCH_CATEGORY_LABEL_KEYS[category])}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                submitSearch();
                closePanel();
              }}
              className="rounded-xl bg-emerald-950 px-5 py-2 text-sm font-semibold text-white"
            >
              {t("applySearch")}
            </button>
          </div>
        </div>
      )}

      {activePanel === "filters" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">{t("filters")}</h3>
            <button type="button" onClick={closePanel} className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2" dir={isRtl ? "rtl" : "ltr"}>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-semibold text-zinc-900">{t("priceRangePerDay")}</p>
              <div className="rounded-2xl border border-zinc-200 p-3">
                <div className="mb-3 flex h-16 items-end gap-1">
                  {priceHistogram.map((value, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t transition-colors ${isBarInSelectedRange(index) ? "bg-emerald-900" : "bg-zinc-200"}`}
                      style={{ height: `${Math.max(8, value * 2)}px` }}
                    />
                  ))}
                </div>
                <div ref={priceTrackRef} className="relative h-8">
                  <div className="absolute top-[11px] h-1 w-full rounded-full bg-zinc-200" />
                  <div
                    className="absolute top-[11px] h-1 rounded-full bg-emerald-900"
                    style={{
                      left: `${rangePercentMaxRtl}%`,
                      right: `${100 - rangePercentMinRtl}%`,
                    }}
                  />
                  <button
                    type="button"
                    onPointerDown={startHandleDrag("min")}
                    className="absolute top-[2px] z-30 h-5 w-5 -translate-x-1/2 rounded-full border border-zinc-300 bg-white shadow-sm"
                    style={{ left: `${rangePercentMinRtl}%` }}
                    aria-label={`${t("minPrice")} ${currency === "ILS" ? "₪" : "$"}`}
                  />
                  <button
                    type="button"
                    onPointerDown={startHandleDrag("max")}
                    className="absolute top-[2px] z-30 h-5 w-5 -translate-x-1/2 rounded-full border border-zinc-300 bg-white shadow-sm"
                    style={{ left: `${rangePercentMaxRtl}%` }}
                    aria-label={`${t("maxPrice")} ${currency === "ILS" ? "₪" : "$"}`}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <label className="rounded-xl border border-zinc-200 px-3 py-2 text-center" dir={isRtl ? "rtl" : "ltr"}>
                    <span className="text-zinc-500">{`${t("minPrice")} ${currency === "ILS" ? "₪" : "$"}`}</span>
                    <input
                      type="number"
                      min={PRICE_MIN}
                      max={maxPrice}
                      value={minPrice}
                      onChange={(event) => onMinPriceInput(event.target.value)}
                      className="mt-1 w-full bg-transparent text-center font-semibold outline-none"
                    />
                  </label>
                  <label className="rounded-xl border border-zinc-200 px-3 py-2 text-center" dir={isRtl ? "rtl" : "ltr"}>
                    <span className="text-zinc-500">{`${t("maxPrice")} ${currency === "ILS" ? "₪" : "$"}`}</span>
                    <input
                      type="number"
                      min={minPrice}
                      max={PRICE_MAX}
                      value={maxPrice}
                      onChange={(event) => onMaxPriceInput(event.target.value)}
                      className="mt-1 w-full bg-transparent text-center font-semibold outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900">{t("equipmentCondition")}</p>
              <select
                value={equipmentCondition}
                onChange={(event) => setEquipmentCondition(event.target.value as (typeof EQUIPMENT_CONDITION_FILTER_IDS)[number])}
                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              >
                {EQUIPMENT_CONDITION_FILTER_IDS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition === "all"
                      ? t("conditionAll")
                      : condition === "new"
                        ? t("conditionNew")
                        : condition === "like_new"
                          ? t("conditionLikeNew")
                          : t("conditionUsed")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900">{t("lenderRating")}</p>
              <select
                value={lenderRating}
                onChange={(event) => setLenderRating(event.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              >
                {lenderRatings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating === "all" ? t("all") : rating}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setMinPrice(PRICE_MIN);
                setMaxPrice(PRICE_MAX);
                setEquipmentCondition("all");
                setLenderRating("all");
              }}
              className="rounded-xl border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-800"
            >
              {t("resetFilters")}
            </button>
            <button type="button" onClick={closePanel} className="rounded-xl bg-emerald-950 px-5 py-2 text-sm font-semibold text-white">
              {t("applyFilters")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function HomeSearchPage() {
  return null;
}
