/** Shared catalog / filter ids used in home search and listing upload. */

export const SEARCH_CATEGORY_IDS = ["photo", "compute", "construction", "garden", "sports", "events"] as const;

/** Locale keys for `t(...)` — use with `useLocale().t` */
export const SEARCH_CATEGORY_LABEL_KEYS: Record<SearchCategoryId, string> = {
  photo: "categoryPhoto",
  compute: "categoryComputingDrones",
  construction: "categoryConstruction",
  garden: "categoryGarden",
  sports: "categorySports",
  events: "categoryEvents",
};

export const EQUIPMENT_CONDITION_FILTER_IDS = ["all", "new", "like_new", "used"] as const;

/** Listing form: concrete condition required (no "all"). */
export const LISTING_CONDITION_IDS = ["new", "like_new", "used"] as const;

export type SearchCategoryId = (typeof SEARCH_CATEGORY_IDS)[number];
export type ListingConditionId = (typeof LISTING_CONDITION_IDS)[number];
