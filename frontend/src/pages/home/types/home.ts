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
}

export default function HomeTypesPage() {
  return null;
}
