"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type ListingConditionId } from "../../lib/catalog-search-constants";
import { inferDemoCategoryFromProductId, type DemoCategoryKey } from "../../lib/demo-category-images";
import { getUserProfile, isUserAuthenticated, type CompanyBusinessType } from "../../lib/auth-session";
import { myProductListings } from "../../lib/my-products.mock";
import { listUploadedOwnerListings, ownerUploadedListingsChangedEventName, saveUploadedOwnerListing } from "../../lib/uploaded-owner-listings";
import { useLocale } from "../../lib/locale-context";

const COMPANY_CATALOG_LAYOUT_KEY = "rentup:company-catalog-layout-v1";

type CategoryPlacement = "top" | "bottom";

interface CatalogGroup {
  id: string;
  name: string;
  productIds: string[];
}

interface CatalogCategory {
  id: string;
  name: string;
  placement: CategoryPlacement;
  productIds: string[];
  groups: CatalogGroup[];
}

interface CompanyCatalogLayoutV2 {
  version: 2;
  categories: CatalogCategory[];
}

interface ProductLite {
  id: string;
  name: string;
  category: DemoCategoryKey;
}

function businessTypeDefaultCategories(type: CompanyBusinessType | undefined): string[] {
  if (type === "events") return ["שולחנות", "כיסאות", "במות", "אוהלים", "ברים ומקררים"];
  if (type === "furniture") return ["כיסאות גבוהים", "כיסאות רגילים", "שולחנות", "כורסאות", "פתרונות ישיבה"];
  if (type === "sound_lighting") return ["רמקולים", "מיקסרים", "מיקרופונים", "תאורה", "עמודי תאורה"];
  if (type === "photo_video") return ["מצלמות", "עדשות", "תאורה לצילום", "חצובות", "רחפנים"];
  if (type === "construction") return ["כלי עבודה", "פיגומים", "גנרטורים", "ציוד בטיחות", "מכונות חיתוך"];
  return ["קטגוריה ראשית", "קטגוריה נוספת", "קטגוריית פרימיום"];
}

function defaultCategories(companyType: CompanyBusinessType | undefined): CatalogCategory[] {
  return businessTypeDefaultCategories(companyType).map((name, idx) => ({
    id: `cat-${idx + 1}-${name.replace(/\s+/g, "-")}`,
    name,
    placement: idx < 3 ? "top" : "bottom",
    productIds: [],
    groups: [],
  }));
}

function createDefaultLayout(companyType: CompanyBusinessType | undefined): CompanyCatalogLayoutV2 {
  return { version: 2, categories: defaultCategories(companyType) };
}

function normalizeGroup(input: Partial<CatalogGroup>): CatalogGroup {
  return {
    id: String(input.id ?? `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    name: String(input.name ?? "").trim(),
    productIds: Array.isArray(input.productIds) ? input.productIds.map((id) => String(id)) : [],
  };
}

function readCatalogLayout(companyType: CompanyBusinessType | undefined): CompanyCatalogLayoutV2 {
  if (typeof window === "undefined") return createDefaultLayout(companyType);
  try {
    const raw = window.localStorage.getItem(COMPANY_CATALOG_LAYOUT_KEY);
    if (!raw) return createDefaultLayout(companyType);
    const parsed = JSON.parse(raw) as
      | Partial<CompanyCatalogLayoutV2>
      | { categoryPlacement?: Record<string, CategoryPlacement>; groups?: CatalogGroup[] };

    if (parsed && (parsed as Partial<CompanyCatalogLayoutV2>).version === 2 && Array.isArray((parsed as Partial<CompanyCatalogLayoutV2>).categories)) {
      return {
        version: 2,
        categories: (parsed as Partial<CompanyCatalogLayoutV2>).categories!.map((category) => ({
          id: String(category.id ?? `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
          name: String(category.name ?? "").trim() || "קטגוריה ללא שם",
          placement: category.placement === "bottom" ? "bottom" : "top",
          productIds: Array.isArray(category.productIds) ? category.productIds.map((id) => String(id)) : [],
          groups: Array.isArray(category.groups) ? category.groups.map((group) => normalizeGroup(group)) : [],
        })),
      };
    }

    const fallback = createDefaultLayout(companyType);
    const old = parsed as { categoryPlacement?: Record<string, CategoryPlacement>; groups?: CatalogGroup[] };
    const firstCategory = fallback.categories[0];
    const migratedGroups = Array.isArray(old.groups) ? old.groups.map((group) => normalizeGroup(group)) : [];
    return {
      version: 2,
      categories: fallback.categories.map((category) => ({
        ...category,
        placement: old.categoryPlacement?.[category.id.replace("cat-", "")] === "bottom" ? "bottom" : category.placement,
        groups: category.id === firstCategory.id ? migratedGroups : [],
      })),
    };
  } catch {
    return createDefaultLayout(companyType);
  }
}

function saveCatalogLayout(layout: CompanyCatalogLayoutV2): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPANY_CATALOG_LAYOUT_KEY, JSON.stringify(layout));
}

export function CatalogManagementPage() {
  const router = useRouter();
  const { language } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<CompanyCatalogLayoutV2>(() => createDefaultLayout(undefined));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newGroupByCategory, setNewGroupByCategory] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const [uploadedBump, setUploadedBump] = useState(0);
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace("/login");
      return;
    }
    const profile = getUserProfile();
    if (profile?.accountType !== "rental_company") {
      router.replace("/my-products?mode=owner&ownerSub=available");
      return;
    }
    if (profile.role !== "admin" && profile.verificationStatus !== "approved") {
      router.replace("/");
      return;
    }
    const loaded = readCatalogLayout(profile.companyBusinessType);
    setLayout(loaded);
    setReady(true);
  }, [router]);

  useEffect(() => {
    const onUploaded = () => setUploadedBump((n) => n + 1);
    window.addEventListener(ownerUploadedListingsChangedEventName(), onUploaded);
    return () => window.removeEventListener(ownerUploadedListingsChangedEventName(), onUploaded);
  }, []);

  const allProducts = useMemo<ProductLite[]>(() => {
    void uploadedBump;
    const uploaded = listUploadedOwnerListings().map((item) => ({ id: item.id, name: item.name, category: item.category }));
    const base = myProductListings
      .filter((item) => item.ownerSub !== undefined)
      .map((item) => ({ id: item.id, name: item.name, category: inferDemoCategoryFromProductId(item.id) }));
    const seen = new Set<string>();
    return [...uploaded, ...base].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [uploadedBump]);

  const saveAndSetLayout = (next: CompanyCatalogLayoutV2) => {
    setLayout(next);
    saveCatalogLayout(next);
  };

  const parseCategory = (raw: string): DemoCategoryKey => {
    const v = raw.trim().toLowerCase();
    if (v === "photo" || v === "צילום") return "photo";
    if (v === "compute" || v === "מחשוב") return "compute";
    if (v === "construction" || v === "בנייה") return "construction";
    if (v === "garden" || v === "גינון") return "garden";
    if (v === "sports" || v === "ספורט") return "sports";
    if (v === "events" || v === "אירועים") return "events";
    return "photo";
  };

  const parseCondition = (raw: string): ListingConditionId => {
    const v = raw.trim().toLowerCase();
    if (v === "new" || v === "חדש") return "new";
    if (v === "like_new" || v === "כמו חדש") return "like_new";
    return "used";
  };

  const parseCsvLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];
      if (c === "\"") {
        if (quoted && line[i + 1] === "\"") {
          cur += "\"";
          i += 1;
        } else {
          quoted = !quoted;
        }
        continue;
      }
      if (c === "," && !quoted) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const importCatalog = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setNotice(language === "he" ? "לא נמצאו שורות לייבוא." : "No rows to import.");
      return;
    }
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const idx = (name: string, fallback: number) => {
      const pos = headers.indexOf(name);
      return pos >= 0 ? pos : fallback;
    };
    const rows = lines.slice(1);
    let count = 0;
    for (const row of rows) {
      const cells = parseCsvLine(row);
      const name = cells[idx("name", 0)] ?? "";
      const price = Number(cells[idx("priceperday", 1)] ?? "");
      const units = Number(cells[idx("unitstotal", 2)] ?? "");
      const category = parseCategory(cells[idx("category", 3)] ?? "");
      const city = cells[idx("city", 4)] ?? "";
      const condition = parseCondition(cells[idx("condition", 5)] ?? "");
      const depositRaw = Number(cells[idx("deposit", 6)] ?? "");
      const description = cells[idx("description", 7)] ?? "";
      const imageFrontUrl = cells[idx("imagefronturl", 8)] ?? "";
      const imageBackUrl = cells[idx("imagebackurl", 9)] ?? "";
      const imageRightUrl = cells[idx("imagerighturl", 10)] ?? "";
      const imageLeftUrl = cells[idx("imagelefturl", 11)] ?? "";
      if (!name || Number.isNaN(price) || price <= 0 || Number.isNaN(units) || units <= 0) continue;
      saveUploadedOwnerListing({
        name,
        pricePerDay: price,
        unitsTotal: Math.floor(units),
        category,
        city: city || undefined,
        condition,
        deposit: Number.isNaN(depositRaw) ? undefined : depositRaw,
        description: description || undefined,
        imageFrontUrl: imageFrontUrl || undefined,
        imageBackUrl: imageBackUrl || undefined,
        imageRightUrl: imageRightUrl || undefined,
        imageLeftUrl: imageLeftUrl || undefined,
      });
      count += 1;
    }
    setNotice(count > 0 ? (language === "he" ? `יובאו ${count} מוצרים.` : `Imported ${count} products.`) : language === "he" ? "לא יובאו מוצרים." : "No products imported.");
  };

  const createCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const next: CompanyCatalogLayoutV2 = {
      ...layout,
      categories: [
        ...layout.categories,
        {
          id: `cat-custom-${Date.now()}`,
          name,
          placement: "top",
          productIds: [],
          groups: [],
        },
      ],
    };
    saveAndSetLayout(next);
    setNewCategoryName("");
  };

  const updateCategory = (categoryId: string, updater: (category: CatalogCategory) => CatalogCategory) => {
    const next: CompanyCatalogLayoutV2 = {
      ...layout,
      categories: layout.categories.map((category) => (category.id === categoryId ? updater(category) : category)),
    };
    saveAndSetLayout(next);
  };

  const deleteCategory = (categoryId: string) => {
    const next: CompanyCatalogLayoutV2 = {
      ...layout,
      categories: layout.categories.filter((category) => category.id !== categoryId),
    };
    saveAndSetLayout(next);
  };

  const moveCategory = (draggedId: string, targetId?: string) => {
    if (!draggedId) return;
    const dragged = layout.categories.find((category) => category.id === draggedId);
    if (!dragged) return;

    const withoutDragged = layout.categories.filter((category) => category.id !== draggedId);
    const insertAt = targetId ? withoutDragged.findIndex((category) => category.id === targetId) : -1;
    const normalizedDragged = { ...dragged, placement: "top" as const };
    if (insertAt >= 0) {
      withoutDragged.splice(insertAt, 0, normalizedDragged);
    } else {
      withoutDragged.push(normalizedDragged);
    }

    const next: CompanyCatalogLayoutV2 = {
      ...layout,
      categories: withoutDragged.map((category) => ({ ...category, placement: "top" as const })),
    };
    saveAndSetLayout(next);
  };

  const moveCategoryByOffset = (categoryId: string, direction: "up" | "down") => {
    const currentIndex = layout.categories.findIndex((category) => category.id === categoryId);
    if (currentIndex < 0) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= layout.categories.length) return;
    const targetId = layout.categories[targetIndex].id;
    moveCategory(categoryId, targetId);
  };

  const createGroupUnderCategory = (categoryId: string) => {
    const name = (newGroupByCategory[categoryId] ?? "").trim();
    if (!name) return;
    updateCategory(categoryId, (category) => ({
      ...category,
      groups: [...category.groups, { id: `grp-${Date.now()}`, name, productIds: [] }],
    }));
    setNewGroupByCategory((prev) => ({ ...prev, [categoryId]: "" }));
  };

  if (!ready) return null;

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-zinc-900">{language === "he" ? "עיצוב קטלוג" : "Catalog design"}</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/catalog-preview" className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
              {language === "he" ? "תצוגת לקוח" : "Customer preview"}
            </Link>
            <Link href="/my-products?mode=owner&ownerSub=allProducts" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
              {language === "he" ? "חזרה למוצרים שלי" : "Back to my products"}
            </Link>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-zinc-700">{language === "he" ? "ייבוא מרוכז דרך קובץ CSV בפורמט המוגדר." : "Bulk import catalog by CSV."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/company-catalog-template.csv" download className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
              {language === "he" ? "הורדת תבנית CSV" : "Download CSV template"}
            </a>
            <button type="button" onClick={() => importRef.current?.click()} className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white hover:bg-emerald-900">
              {language === "he" ? "ייבוא קטלוג מקובץ" : "Import catalog file"}
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importCatalog(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
          {notice ? <p className="mt-2 text-sm font-medium text-emerald-900">{notice}</p> : null}
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-zinc-900">{language === "he" ? "סידור שורות הקטלוג (כל שורה = קטגוריה)" : "Catalog row builder (each row = category)"}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={language === "he" ? "שם קטגוריה חדשה" : "New category name"}
              className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none"
            />
            <button type="button" onClick={createCategory} className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white hover:bg-emerald-900">
              {language === "he" ? "הוספת קטגוריה" : "Add category"}
            </button>
          </div>

          <div
            className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingCategoryId) {
                moveCategory(draggingCategoryId);
                setDraggingCategoryId(null);
              }
            }}
          >
            {layout.categories.length === 0 ? (
              <p className="text-sm text-zinc-500">{language === "he" ? "אין קטגוריות כרגע. הוסיפו שורה חדשה." : "No categories yet. Add a new row."}</p>
            ) : (
              layout.categories.map((category, rowIndex) => (
                <article
                  key={category.id}
                  draggable
                  onDragStart={() => setDraggingCategoryId(category.id)}
                  onDragEnd={() => setDraggingCategoryId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingCategoryId && draggingCategoryId !== category.id) {
                      moveCategory(draggingCategoryId, category.id);
                      setDraggingCategoryId(null);
                    }
                  }}
                  className="rounded-xl border border-zinc-200 bg-white p-3"
                >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="cursor-grab rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">::</span>
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900">
                            {language === "he" ? `שורה ${rowIndex + 1}` : `Row ${rowIndex + 1}`}
                          </span>
                          <input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, (current) => ({ ...current, name: e.target.value }))}
                            className="h-9 flex-1 rounded-lg border border-zinc-200 px-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => moveCategoryByOffset(category.id, "up")}
                            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            {language === "he" ? "למעלה" : "Up"}
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCategoryByOffset(category.id, "down")}
                            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            {language === "he" ? "למטה" : "Down"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(category.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-100"
                          >
                            {language === "he" ? "מחיקה" : "Delete"}
                          </button>
                        </div>

                        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2">
                          <p className="mb-2 text-xs font-semibold text-zinc-700">{language === "he" ? "מוצרים בקטגוריה" : "Category products"}</p>
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {allProducts.map((item) => (
                              <label key={`${category.id}-p-${item.id}`} className="flex items-center gap-2 rounded-md bg-white px-2 py-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={category.productIds.includes(item.id)}
                                  onChange={() =>
                                    updateCategory(category.id, (current) => ({
                                      ...current,
                                      productIds: current.productIds.includes(item.id)
                                        ? current.productIds.filter((id) => id !== item.id)
                                        : [...current.productIds, item.id],
                                    }))
                                  }
                                />
                                <span className="truncate">{item.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2">
                          <p className="mb-2 text-xs font-semibold text-zinc-700">{language === "he" ? "קבוצות תחת הקטגוריה" : "Groups under category"}</p>
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row">
                            <input
                              value={newGroupByCategory[category.id] ?? ""}
                              onChange={(e) => setNewGroupByCategory((prev) => ({ ...prev, [category.id]: e.target.value }))}
                              placeholder={language === "he" ? "שם קבוצה (למשל: כיסאות גבוהים)" : "Group name"}
                              className="h-9 flex-1 rounded-lg border border-zinc-200 px-2 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => createGroupUnderCategory(category.id)}
                              className="rounded-lg bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
                            >
                              {language === "he" ? "יצירת קבוצה" : "Create group"}
                            </button>
                          </div>

                          <div className="space-y-2">
                            {category.groups.length === 0 ? (
                              <p className="text-xs text-zinc-500">{language === "he" ? "אין קבוצות בקטגוריה." : "No groups in this category."}</p>
                            ) : (
                              category.groups.map((group) => (
                                <article key={group.id} className="rounded-md border border-zinc-200 bg-white p-2">
                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <input
                                      value={group.name}
                                      onChange={(e) =>
                                        updateCategory(category.id, (current) => ({
                                          ...current,
                                          groups: current.groups.map((row) => (row.id === group.id ? { ...row, name: e.target.value } : row)),
                                        }))
                                      }
                                      className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateCategory(category.id, (current) => ({
                                          ...current,
                                          groups: current.groups.filter((row) => row.id !== group.id),
                                        }))
                                      }
                                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-900 hover:bg-red-100"
                                    >
                                      {language === "he" ? "מחיקה" : "Delete"}
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    {allProducts.map((item) => (
                                      <label key={`${group.id}-${item.id}`} className="flex items-center gap-2 rounded-md bg-zinc-50 px-2 py-1 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={group.productIds.includes(item.id)}
                                          onChange={() =>
                                            updateCategory(category.id, (current) => ({
                                              ...current,
                                              groups: current.groups.map((row) =>
                                                row.id !== group.id
                                                  ? row
                                                  : {
                                                      ...row,
                                                      productIds: row.productIds.includes(item.id)
                                                        ? row.productIds.filter((id) => id !== item.id)
                                                        : [...row.productIds, item.id],
                                                    },
                                              ),
                                            }))
                                          }
                                        />
                                        <span className="truncate">{item.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </article>
                              ))
                            )}
                          </div>
                        </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default CatalogManagementPage;

