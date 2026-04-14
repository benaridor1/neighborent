export type LenderType = "private" | "company";

export interface HomeProduct {
  id: string;
  name: string;
  city: string;
  rating: number;
  pricePerDay: number;
  imageUrl: string;
  lenderType: LenderType;
}

export interface HomeCategory {
  id: string;
  title: string;
  products: HomeProduct[];
  /** Total private listings in this category (home shows 6; badge shows +N for the rest). */
  privateListingTotal?: number;
}

export interface RentalCompany {
  id: string;
  category: string;
  region: string;
  rating: number;
  imageUrl: string;
}

export interface RentalCompanyCategory {
  id: string;
  title: string;
  companies: RentalCompany[];
}

export default function HomeTypesPage() {
  return null;
}
