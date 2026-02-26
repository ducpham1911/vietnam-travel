export type PlaceCategory =
  | "landmark"
  | "temple"
  | "beach"
  | "restaurant"
  | "market"
  | "museum"
  | "nature"
  | "cafe"
  | "nightlife";

export interface City {
  id: string;
  name: string;
  region: string;
  description: string;
  gradientIndex: number;
  imageAsset: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  cityId: string;
  rating: number;
  priceLevel: number; // 1-3
  recommendedDishes: string[];
}

export interface CategoryConfig {
  id: PlaceCategory;
  label: string;
  icon: string; // Lucide icon name
  color: string; // hex color
  hasDishes: boolean;
}
