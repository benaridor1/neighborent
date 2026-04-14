import {
  demoProductCardImage,
  getRegisteredCompanySector,
  inferDemoCategoryFromProductId,
  type DemoCategoryKey,
} from "../../../lib/demo-category-images";
import {
  getRentalCatalogItemById,
  getRentalCompanyById,
  rentalCatalogDisplayName,
} from "../../../lib/rental-company-catalog.mock";
import { homeCategories } from "../../home/data/home.mock";
import { ProductDetailsItem } from "../types/product-details";

const fallbackProduct: ProductDetailsItem = {
  id: "fallback",
  name: "Canon EOS 750D",
  city: "תל אביב",
  rating: 4.8,
  reviewsCount: 129,
  pricePerDay: 100,
  images: [
    demoProductCardImage("photo", "fallback", 0),
    demoProductCardImage("photo", "fallback", 1),
    demoProductCardImage("photo", "fallback", 2),
  ],
  description:
    "מצלמה קלה ונוחה לצילום סטילס ווידאו. מתאימה ליוצרים, לטיולים, ולהפקות קצרות עם תוצאות איכותיות.",
  specs: [
    { label: "דגם", value: "Canon EOS 750D" },
    { label: "כולל", value: "סוללה, מטען, רצועה" },
    { label: "איסוף", value: "תל אביב מרכז" },
    { label: "זמינות", value: "מיידית" },
  ],
};

function buildHomeProductDetails(): Record<string, ProductDetailsItem> {
  const map: Record<string, ProductDetailsItem> = {};
  for (const category of homeCategories) {
    const cat = category.id as DemoCategoryKey;
    for (const p of category.products) {
      map[p.id] = {
        id: p.id,
        name: p.name,
        city: p.city,
        rating: p.rating,
        reviewsCount: Math.max(12, Math.round(p.rating * 26)),
        pricePerDay: p.pricePerDay,
        images: [
          p.imageUrl,
          demoProductCardImage(cat, p.id, 1),
          demoProductCardImage(cat, p.id, 2),
        ],
        description:
          "מוצר להשכרה במצב מצוין. מתאים לשימוש ביתי ומקצועי קצר. נשמח לעזור בתיאום מסירה והחזרה נוחים.",
        specs: [
          { label: "דגם / שם", value: p.name },
          { label: "אזור", value: p.city },
          { label: "סוג משכיר", value: p.lenderType === "private" ? "משכיר פרטי" : "חברת השכרה" },
          { label: "זמינות", value: "לפי תיאום" },
        ],
      };
    }
  }
  return map;
}

const homeProductDetailsById = buildHomeProductDetails();

export function normalizeProductId(raw: string): string {
  const id = decodeURIComponent(raw ?? "").trim();
  if (!id) return "";
  if (/^\d+$/.test(id)) {
    const n = parseInt(id, 10);
    if (Number.isFinite(n) && n > 0) return `p${n}`;
  }
  return id;
}

function buildRentalCatalogProductDetails(itemId: string, language: string): ProductDetailsItem | null {
  const item = getRentalCatalogItemById(itemId);
  if (!item) return null;
  const company = getRentalCompanyById(item.companyId);
  const name = rentalCatalogDisplayName(item, language);
  const sector = getRegisteredCompanySector(item.companyId) ?? "compute";
  const isHeFamily = language === "he" || language === "ar";
  const city = company ? (isHeFamily ? company.region : "Israel") : fallbackProduct.city;
  const rating = company?.rating ?? 4.6;
  const reviewsCount = Math.max(8, Math.round(rating * 22));
  const description = isHeFamily
    ? `${name} להשכרה במצב מצוין דרך קטלוג חברת ההשכרה. המחיר לפי יום; ניתן להוסיף לסל, לבחור כמות, ולבדוק זמינות לפני אישור ההזמנה.`
    : `${name} for rent in excellent condition via the rental company catalog. Price is per day; add to the company cart, choose quantity, and check availability before confirming.`;
  const spec = (he: string, en: string, value: string) => ({
    label: isHeFamily ? he : en,
    value,
  });
  const whatsIncluded = isHeFamily
    ? ["אריזה מהיבואן", "כבלים בסיסיים", "מדריך הפעלה קצר"]
    : ["Retailer packaging", "Basic cables", "Quick start guide"];

  return {
    id: item.id,
    name,
    city,
    rating,
    reviewsCount,
    pricePerDay: item.pricePerDay,
    images: [
      item.imageUrl,
      demoProductCardImage(sector, item.id, 1),
      demoProductCardImage(sector, item.id, 2),
    ],
    description,
    whatsIncluded,
    specs: [
      spec("מוצר", "Item", name),
      spec("חברה", "Company", company?.category ?? "—"),
      spec("אזור", "Area", company?.region ?? "—"),
      spec("זמינות", "Availability", isHeFamily ? "לפי תיאום" : "By arrangement"),
    ],
    rentalCompanyId: item.companyId,
  };
}

function syntheticProduct(id: string): ProductDetailsItem {
  const cat = inferDemoCategoryFromProductId(id);
  return {
    ...fallbackProduct,
    id,
    name: "מוצר להשכרה",
    images: [
      demoProductCardImage(cat, id, 0),
      demoProductCardImage(cat, id, 1),
      demoProductCardImage(cat, id, 2),
    ],
    specs: [
      { label: "מזהה", value: id },
      { label: "איסוף", value: fallbackProduct.city },
      { label: "זמינות", value: "לפי תיאום" },
    ],
  };
}

const productDetailsById: Record<string, ProductDetailsItem> = {
  p1: {
    ...fallbackProduct,
    id: "p1",
    name: "Canon G7X Mark II",
    pricePerDay: 150,
    images: [
      demoProductCardImage("photo", "p1", 0),
      demoProductCardImage("photo", "p1", 1),
      demoProductCardImage("photo", "p1", 2),
    ],
  },
  p2: {
    ...fallbackProduct,
    id: "p2",
    name: "Canon EOS 750D",
    pricePerDay: 100,
    images: [
      demoProductCardImage("photo", "p2", 0),
      demoProductCardImage("photo", "p2", 1),
      demoProductCardImage("photo", "p2", 2),
    ],
  },
  p3: {
    ...fallbackProduct,
    id: "p3",
    name: "Sony A7 III",
    city: "נתניה",
    rating: 4.8,
    pricePerDay: 180,
    images: [
      demoProductCardImage("photo", "p3", 0),
      demoProductCardImage("photo", "p3", 1),
      demoProductCardImage("photo", "p3", 2),
    ],
  },
  c1: {
    ...fallbackProduct,
    id: "c1",
    name: "MacBook Pro M3",
    pricePerDay: 180,
    images: [
      demoProductCardImage("compute", "c1", 0),
      demoProductCardImage("compute", "c1", 1),
      demoProductCardImage("compute", "c1", 2),
    ],
  },
  t1: {
    ...fallbackProduct,
    id: "t1",
    name: "Bosch PSB 500",
    pricePerDay: 200,
    images: [
      demoProductCardImage("construction", "t1", 0),
      demoProductCardImage("construction", "t1", 1),
      demoProductCardImage("construction", "t1", 2),
    ],
  },
};

export function getProductDetails(rawId: string, language = "he"): ProductDetailsItem {
  const id = normalizeProductId(rawId);
  if (!id) return { ...fallbackProduct, id: "unknown" };
  const rental = buildRentalCatalogProductDetails(id, language);
  if (rental) return rental;
  return productDetailsById[id] ?? homeProductDetailsById[id] ?? syntheticProduct(id);
}

export default function ProductDetailsDataPage() {
  return null;
}
