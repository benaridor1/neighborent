export type ProviderType = "private" | "company";

export interface HomeProduct {
  id: string;
  title: string;
  city: string;
  rating: number;
  pricePerDay: number;
  imageUrl: string;
  providerType: ProviderType;
}

export interface HomeCategory {
  id: string;
  title: string;
  products: HomeProduct[];
}
