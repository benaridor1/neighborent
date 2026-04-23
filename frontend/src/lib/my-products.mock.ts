import { demoCompanyCardImage, demoProductCardImage } from "./demo-category-images";

export type MyProductStatusKey = "unavailability" | "pending" | "paymentDue" | "live" | "completed";

export type MyProductPrimaryAction = "confirmDelivery" | "pickAvailability" | "moreInfo" | "payNow";

/** מוצרים שלי: אצלי / אצל לקוח */
export type MyProductOwnerSub = "available" | "rentalRequestsPending" | "upcomingRental" | "leasedOut" | "verificationStatus" | "allProducts";

/** מוצרים שאני שוכר */
export type MyProductRenterSub = "pendingApproval" | "awaitingPayment" | "rentingSoon" | "current" | "past";

/** לפני תחילת תקופת ההשכרה: איסוף + פרטי משכיר (דמו) */
export type RenterPickupDetails = {
  pickupWhenLabel: string;
  pickupWhereLabel: string;
  lenderDisplayName: string;
  lenderPhone: string;
  lenderEmail: string;
  /** Path under /messages/:id */
  messagesThreadPath: string;
};

export type RentalRequestKind = "private" | "companyCart";

export interface RentalRequestInfo {
  renterName: string;
  renterRating: number;
  dateFromLabel: string;
  dateToLabel: string;
  productLines: string[];
  kind: RentalRequestKind;
}

export interface MyProductListing {
  id: string;
  name: string;
  imageUrl: string;
  pricePerDay: number;
  /** מוצרים שאני משכיר לעולם */
  ownerSub?: MyProductOwnerSub;
  /** מוצרים שאני שוכר */
  renterSub?: MyProductRenterSub;
  /** שוכר בקרוב: פרטי איסוף ומשכיר */
  renterPickupDetails?: RenterPickupDetails;
  statusKey: MyProductStatusKey;
  publishedAt: string;
  rentalsCount: number;
  /** Owner inventory size (how many units can be rented) */
  unitsTotal?: number;
  primaryAction: MyProductPrimaryAction;
  /** Override default `/products/:id` link for renter rows */
  detailHref?: string;
  /** Shown when primaryAction is payNow */
  checkoutHref?: string;
  /** Stable id for checkout + paid-state (defaults to `id`) */
  listingId?: string;
  /** Extra line for company-cart style rows */
  summaryLine?: string;
  /** Owner: בקשת השכרה לאישור — פרטי שוכר ותאריכים */
  rentalRequest?: RentalRequestInfo;
  /** Renter: מוכנים לתשלום — תקופה וחישוב לפני כניסה לדף תשלום */
  rentalPaymentSummary?: {
    dateFromLabel: string;
    dateToLabel: string;
    billableDays: number;
  };
}

export const myProductListings: MyProductListing[] = [
  {
    id: "p1",
    name: "Canon G7X Mark II",
    imageUrl: demoProductCardImage("photo", "p1"),
    pricePerDay: 150,
    ownerSub: "available",
    statusKey: "unavailability",
    publishedAt: "19.8.2025",
    rentalsCount: 173,
    unitsTotal: 5,
    primaryAction: "pickAvailability",
  },
  {
    id: "t1",
    name: "Bosch PSB 500",
    imageUrl: demoProductCardImage("construction", "t1"),
    pricePerDay: 200,
    ownerSub: "available",
    statusKey: "unavailability",
    publishedAt: "2.7.2025",
    rentalsCount: 42,
    unitsTotal: 2,
    primaryAction: "pickAvailability",
  },
  {
    id: "owner-req-private-demo",
    name: "Sony A7 III",
    imageUrl: demoProductCardImage("photo", "p3"),
    pricePerDay: 180,
    ownerSub: "rentalRequestsPending",
    statusKey: "pending",
    publishedAt: "10.4.2026",
    rentalsCount: 0,
    primaryAction: "moreInfo",
    detailHref: "/products/p3",
    rentalRequest: {
      renterName: "דני כהן",
      renterRating: 4.7,
      dateFromLabel: "18.4.2026",
      dateToLabel: "22.4.2026",
      productLines: ["Sony A7 III ×1"],
      kind: "private",
    },
  },
  {
    id: "owner-req-company-demo",
    name: "סל חברת השכרה — ציוד צילום",
    imageUrl: demoCompanyCardImage("rc1"),
    pricePerDay: 420,
    ownerSub: "rentalRequestsPending",
    statusKey: "pending",
    publishedAt: "9.4.2026",
    rentalsCount: 0,
    primaryAction: "moreInfo",
    detailHref: "/rental-companies/rc1",
    summaryLine: "DJI Mini 3 Pro ×1 · MacBook Pro M3 ×1",
    rentalRequest: {
      renterName: "מירי לוי",
      renterRating: 4.9,
      dateFromLabel: "1.5.2026",
      dateToLabel: "5.5.2026",
      productLines: ["DJI Mini 3 Pro ×1", "MacBook Pro M3 ×1"],
      kind: "companyCart",
    },
  },
  {
    id: "owner-upcoming-demo",
    name: "Canon EOS 750D",
    imageUrl: demoProductCardImage("photo", "p2"),
    pricePerDay: 100,
    ownerSub: "upcomingRental",
    statusKey: "live",
    publishedAt: "11.3.2025",
    rentalsCount: 8,
    primaryAction: "moreInfo",
    detailHref: "/products/p2",
    rentalRequest: {
      renterName: "עומר גולן",
      renterRating: 4.6,
      dateFromLabel: "25.4.2026",
      dateToLabel: "28.4.2026",
      productLines: ["Canon EOS 750D ×1"],
      kind: "private",
    },
  },
  {
    id: "p2",
    name: "Canon EOS 750D",
    imageUrl: demoProductCardImage("photo", "p2"),
    pricePerDay: 100,
    ownerSub: "leasedOut",
    statusKey: "pending",
    publishedAt: "11.3.2025",
    rentalsCount: 8,
    primaryAction: "moreInfo",
    rentalRequest: {
      renterName: "עומר גולן",
      renterRating: 4.6,
      dateFromLabel: "11.3.2025",
      dateToLabel: "20.3.2025",
      productLines: ["Canon EOS 750D ×1"],
      kind: "private",
    },
  },
  {
    id: "rent-pending-demo",
    name: "Nikon Z6 II",
    imageUrl: demoProductCardImage("photo", "p7"),
    pricePerDay: 195,
    renterSub: "pendingApproval",
    statusKey: "pending",
    publishedAt: "8.4.2026",
    rentalsCount: 0,
    primaryAction: "moreInfo",
    detailHref: "/products/p7",
  },
  {
    id: "rent-pay-private-demo",
    name: "Sony A7 III",
    listingId: "rent-pay-private-demo",
    imageUrl: demoProductCardImage("photo", "p3"),
    pricePerDay: 180,
    renterSub: "awaitingPayment",
    statusKey: "paymentDue",
    publishedAt: "3.4.2026",
    rentalsCount: 0,
    primaryAction: "payNow",
    detailHref: "/products/p3",
    checkoutHref: "/checkout?type=private&productId=p3&demo=1&listingId=rent-pay-private-demo",
    rentalPaymentSummary: {
      dateFromLabel: "25.4.2026",
      dateToLabel: "29.4.2026",
      billableDays: 5,
    },
  },
  {
    id: "rent-pay-company-demo",
    name: "Rental cart — demo company",
    listingId: "rent-pay-company-demo",
    imageUrl: demoCompanyCardImage("rc1"),
    pricePerDay: 420,
    renterSub: "awaitingPayment",
    statusKey: "paymentDue",
    publishedAt: "2.4.2026",
    rentalsCount: 0,
    primaryAction: "payNow",
    detailHref: "/rental-companies/rc1",
    checkoutHref: "/checkout?type=company&companyId=rc1&demo=1&listingId=rent-pay-company-demo",
    summaryLine: "DJI Mini 3 Pro ×1 · MacBook Pro M3 ×1",
    rentalPaymentSummary: {
      dateFromLabel: "28.4.2026",
      dateToLabel: "2.5.2026",
      billableDays: 5,
    },
  },
  {
    id: "rent-soon-demo-a7",
    name: "Sony A7 III",
    imageUrl: demoProductCardImage("photo", "p3"),
    pricePerDay: 180,
    renterSub: "rentingSoon",
    statusKey: "live",
    publishedAt: "10.4.2026",
    rentalsCount: 0,
    primaryAction: "moreInfo",
    detailHref: "/products/p3",
    renterPickupDetails: {
      pickupWhenLabel: "יום ראשון 20.4.2026, 18:00",
      pickupWhereLabel: "רח׳ הרצל 12, תל אביב",
      lenderDisplayName: "Tomer Tenenbaum",
      lenderPhone: "+972-52-555-0142",
      lenderEmail: "tomer.demo@rentup.local",
      messagesThreadPath: "t1",
    },
  },
  {
    id: "p3",
    name: "Sony A7 III",
    imageUrl: demoProductCardImage("photo", "p3"),
    pricePerDay: 180,
    renterSub: "current",
    statusKey: "live",
    publishedAt: "5.1.2025",
    rentalsCount: 61,
    primaryAction: "moreInfo",
  },
  {
    id: "p5",
    name: "Coolpix P900",
    imageUrl: demoProductCardImage("photo", "p5"),
    pricePerDay: 70,
    renterSub: "past",
    statusKey: "completed",
    publishedAt: "12.11.2024",
    rentalsCount: 3,
    primaryAction: "moreInfo",
  },
];
