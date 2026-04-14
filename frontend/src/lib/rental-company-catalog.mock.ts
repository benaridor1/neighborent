import { demoCatalogProductImage } from "./demo-category-images";
import { rentalCompanyCategories } from "../pages/home/data/home.mock";
import type { RentalCompany } from "../pages/home/types/home";

export interface RentalCompanyCatalogItem {
  id: string;
  companyId: string;
  sectionId: string;
  nameHe: string;
  nameEn: string;
  pricePerDay: number;
  imageUrl: string;
}

export interface RentalCompanyCatalogSection {
  id: string;
  companyId: string;
  titleHe: string;
  titleEn: string;
  products: RentalCompanyCatalogItem[];
}

type Sector = "photo" | "tech" | "construction" | "garden" | "sports" | "events";

const companySectorById: Record<string, Sector> = (() => {
  const m: Record<string, Sector> = {};
  for (const block of rentalCompanyCategories) {
    const sector: Sector =
      block.id === "camera-companies"
        ? "photo"
        : block.id === "tech-companies"
          ? "tech"
          : block.id === "garden-companies"
            ? "garden"
            : block.id === "sports-companies"
              ? "sports"
              : block.id === "events-companies"
                ? "events"
                : "construction";
    for (const c of block.companies) {
      m[c.id] = sector;
    }
  }
  return m;
})();

function sectorForCompanyId(companyId: string): Sector {
  return companySectorById[companyId] ?? "construction";
}

type Line = { nameHe: string; nameEn: string; price: number; seed: string };

/** Visible cards per section on the company catalog row before "see all". */
export const RENTAL_CATALOG_SECTION_PREVIEW = 3;
const TARGET_SECTION_PRODUCT_COUNT = 8;

function padSectionLines(lines: Line[]): Line[] {
  if (lines.length >= TARGET_SECTION_PRODUCT_COUNT) {
    return lines.slice(0, TARGET_SECTION_PRODUCT_COUNT);
  }
  const out = [...lines];
  let idx = 0;
  while (out.length < TARGET_SECTION_PRODUCT_COUNT) {
    const src = lines[idx % lines.length];
    const k = out.length + 1;
    out.push({
      nameHe: `${src.nameHe} (${k})`,
      nameEn: `${src.nameEn} (${k})`,
      price: Math.max(8, src.price - (idx % 3) * 5),
      seed: `${src.seed}-m${k}`,
    });
    idx++;
  }
  return out;
}

function makeSection(companyId: string, sectionIndex: number, titleHe: string, titleEn: string, lines: Line[]): RentalCompanyCatalogSection {
  const sectionId = `${companyId}-s${sectionIndex}`;
  const padded = padSectionLines(lines);
  return {
    id: sectionId,
    companyId,
    titleHe,
    titleEn,
    products: padded.map((line, pi) => ({
      id: `${sectionId}-p${pi}`,
      companyId,
      sectionId,
      nameHe: line.nameHe,
      nameEn: line.nameEn,
      pricePerDay: line.price,
      imageUrl: demoCatalogProductImage(companyId, `${line.seed}-p${pi}`),
    })),
  };
}

function blueprintEvents(companyId: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "כיסאות", "Chairs", [
      { nameHe: "כיסא מתקפל לאירועים", nameEn: "Folding event chair", price: 12, seed: `${companyId}-chairs-1` },
      { nameHe: "כיסא בר גבוה", nameEn: "High bar stool", price: 18, seed: `${companyId}-chairs-2` },
      { nameHe: "כיסא זוג VIP", nameEn: "VIP padded chair", price: 35, seed: `${companyId}-chairs-3` },
    ]),
    makeSection(companyId, 1, "שולחנות", "Tables", [
      { nameHe: "שולחן אירועים 180×80", nameEn: "Event table 180×80 cm", price: 45, seed: `${companyId}-tbl-1` },
      { nameHe: "שולחן קוקטייל עגול", nameEn: "Round cocktail table", price: 28, seed: `${companyId}-tbl-2` },
      { nameHe: "שולחן ציוד DJ", nameEn: "DJ folding table", price: 22, seed: `${companyId}-tbl-3` },
    ]),
    makeSection(companyId, 2, "הצללה וקול", "Lighting & sound", [
      { nameHe: "פנס LED לאירוע", nameEn: "LED event wash light", price: 55, seed: `${companyId}-led-1` },
      { nameHe: "מערכת הגברה קומפקטית", nameEn: "Compact PA system", price: 120, seed: `${companyId}-pa-1` },
    ]),
    makeSection(companyId, 3, "אביזרי אירוע", "Event accessories", [
      { nameHe: "גדר מתכת להפרדה", nameEn: "Crowd barrier set", price: 40, seed: `${companyId}-acc-1` },
      { nameHe: "אוהל צל 3×3", nameEn: "3×3 m shade tent", price: 85, seed: `${companyId}-acc-2` },
    ]),
  ];
}

function blueprintPhoto(companyId: string, label: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "מצלמות", "Cameras", [
      { nameHe: `מצלמת רפלקס — ${label}`, nameEn: `DSLR body — ${label}`, price: 140, seed: `${companyId}-cam-1` },
      { nameHe: "מצלמת וידאו קומפקטית", nameEn: "Compact video camera", price: 95, seed: `${companyId}-cam-2` },
    ]),
    makeSection(companyId, 1, "עדשות ומתאמים", "Lenses & adapters", [
      { nameHe: "עדשת זום 24–70", nameEn: "24–70mm zoom lens", price: 75, seed: `${companyId}-lens-1` },
      { nameHe: "מתאם עדשות ישנות", nameEn: "Vintage lens adapter", price: 25, seed: `${companyId}-lens-2` },
    ]),
    makeSection(companyId, 2, "חצובות ותאורה", "Tripods & lighting", [
      { nameHe: "חצובה אלומיניום", nameEn: "Aluminum tripod", price: 30, seed: `${companyId}-tri-1` },
      { nameHe: "תאורת LED ניידת", nameEn: "Portable LED panel", price: 42, seed: `${companyId}-tri-2` },
    ]),
  ];
}

function blueprintTech(companyId: string, label: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "לפטופים", "Laptops", [
      { nameHe: `לפטופ עבודה — ${label}`, nameEn: `Work laptop — ${label}`, price: 110, seed: `${companyId}-lap-1` },
      { nameHe: "לפטופ גיימינג", nameEn: "Gaming laptop", price: 165, seed: `${companyId}-lap-2` },
    ]),
    makeSection(companyId, 1, "טאבלטים", "Tablets", [
      { nameHe: "טאבלט 11 אינץ׳", nameEn: "11-inch tablet", price: 55, seed: `${companyId}-tab-1` },
      { nameHe: "טאבלט עם עט", nameEn: "Tablet with stylus", price: 68, seed: `${companyId}-tab-2` },
    ]),
    makeSection(companyId, 2, "מסכים ואביזרים", "Monitors & accessories", [
      { nameHe: "מסך 27 אינץ׳ 4K", nameEn: "27-inch 4K monitor", price: 72, seed: `${companyId}-mon-1` },
      { nameHe: "Docking station", nameEn: "USB-C dock", price: 28, seed: `${companyId}-mon-2` },
    ]),
  ];
}

function blueprintConstruction(companyId: string, label: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "כלי חשמל לבנייה", "Construction power tools", [
      { nameHe: `מקדחה/מברגה — ${label}`, nameEn: `Combi drill — ${label}`, price: 48, seed: `${companyId}-pw-1` },
      { nameHe: "משחזת זווית", nameEn: "Angle grinder", price: 38, seed: `${companyId}-pw-2` },
    ]),
    makeSection(companyId, 1, "מדידה וסימון", "Measuring & layout", [
      { nameHe: "סט מפתחות מקצועי", nameEn: "Pro wrench set", price: 22, seed: `${companyId}-ht-1` },
      { nameHe: "מד לייזר", nameEn: "Laser distance meter", price: 35, seed: `${companyId}-ht-2` },
    ]),
    makeSection(companyId, 2, "גבהים ופיגומים", "Scaffolding & access", [
      { nameHe: "סולם טלסקופי", nameEn: "Telescopic ladder", price: 55, seed: `${companyId}-ld-1` },
      { nameHe: "פיגום נייד נמוך", nameEn: "Low mobile scaffold", price: 95, seed: `${companyId}-ld-2` },
    ]),
  ];
}

function blueprintSports(companyId: string, label: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "אופניים ובריחה", "Bikes & ride", [
      { nameHe: `אופני עיר — ${label}`, nameEn: `City bike — ${label}`, price: 55, seed: `${companyId}-bike-1` },
      { nameHe: "קורקינט חשמלי", nameEn: "E-scooter", price: 72, seed: `${companyId}-bike-2` },
    ]),
    makeSection(companyId, 1, "קמפינג", "Camping", [
      { nameHe: "אוהל 4 מקומות", nameEn: "4-person tent", price: 48, seed: `${companyId}-camp-1` },
      { nameHe: "כיסאות קמפינג ×4", nameEn: "Camping chairs ×4", price: 32, seed: `${companyId}-camp-2` },
    ]),
    makeSection(companyId, 2, "מים ואקסטרים", "Water & boards", [
      { nameHe: "סאפ מתנפח", nameEn: "Inflatable SUP", price: 95, seed: `${companyId}-sup-1` },
      { nameHe: "קיאק יחיד", nameEn: "Single kayak", price: 110, seed: `${companyId}-sup-2` },
    ]),
  ];
}

function blueprintGarden(companyId: string, label: string): RentalCompanyCatalogSection[] {
  return [
    makeSection(companyId, 0, "מכסחות ודשא", "Lawn care", [
      { nameHe: `מכסחת דשא — ${label}`, nameEn: `Lawn mower — ${label}`, price: 88, seed: `${companyId}-gm-1` },
      { nameHe: "גוזם גדר חיה", nameEn: "Hedge trimmer", price: 52, seed: `${companyId}-gm-2` },
    ]),
    makeSection(companyId, 1, "השקיה", "Irrigation", [
      { nameHe: "ערכת טפטוף 100 מ׳", nameEn: "Drip irrigation 100 m", price: 42, seed: `${companyId}-irr-1` },
      { nameHe: "מתזים מסתובבים", nameEn: "Rotary sprinklers", price: 35, seed: `${companyId}-irr-2` },
    ]),
    makeSection(companyId, 2, "כלי גינה ידניים", "Hand garden tools", [
      { nameHe: "מגלשע שתילה", nameEn: "Planting spade", price: 18, seed: `${companyId}-hand-1` },
      { nameHe: "מזמרה מקצועית", nameEn: "Pruning shears", price: 22, seed: `${companyId}-hand-2` },
    ]),
  ];
}

function buildCatalogForCompany(co: RentalCompany): RentalCompanyCatalogSection[] {
  if (co.id === "rc3") return blueprintEvents(co.id);
  const sector = sectorForCompanyId(co.id);
  if (sector === "photo") return blueprintPhoto(co.id, co.category);
  if (sector === "tech") return blueprintTech(co.id, co.category);
  if (sector === "garden") return blueprintGarden(co.id, co.category);
  if (sector === "sports") return blueprintSports(co.id, co.category);
  if (sector === "events") return blueprintEvents(co.id);
  return blueprintConstruction(co.id, co.category);
}

const catalogByCompany: Record<string, RentalCompanyCatalogSection[]> = (() => {
  const acc: Record<string, RentalCompanyCatalogSection[]> = {};
  for (const block of rentalCompanyCategories) {
    for (const co of block.companies) {
      acc[co.id] = buildCatalogForCompany(co);
    }
  }
  return acc;
})();

const flatItemsById: Record<string, RentalCompanyCatalogItem> = (() => {
  const m: Record<string, RentalCompanyCatalogItem> = {};
  for (const sections of Object.values(catalogByCompany)) {
    for (const sec of sections) {
      for (const p of sec.products) {
        m[p.id] = p;
      }
    }
  }
  return m;
})();

export function rentalCatalogDisplayName(item: RentalCompanyCatalogItem, lang: string): string {
  return lang === "he" || lang === "ar" ? item.nameHe : item.nameEn;
}

export function rentalCatalogSectionTitle(section: RentalCompanyCatalogSection, lang: string): string {
  return lang === "he" || lang === "ar" ? section.titleHe : section.titleEn;
}

export function getRentalCompanyById(companyId: string): RentalCompany | undefined {
  for (const block of rentalCompanyCategories) {
    const found = block.companies.find((c) => c.id === companyId);
    if (found) return found;
  }
  return undefined;
}

export function getRentalCompanyCatalogSections(companyId: string): RentalCompanyCatalogSection[] {
  return catalogByCompany[companyId] ?? [];
}

/** @deprecated flat list — use sections; kept for any old imports */
export function getRentalCompanyCatalog(companyId: string): RentalCompanyCatalogItem[] {
  return getRentalCompanyCatalogSections(companyId).flatMap((s) => s.products);
}

export function getRentalCatalogItemById(productId: string): RentalCompanyCatalogItem | undefined {
  return flatItemsById[productId];
}

export function isRentalCatalogProductId(productId: string): boolean {
  return Boolean(flatItemsById[productId]);
}
