import { CategoryConfig } from "@/types/city";

export const categories: CategoryConfig[] = [
  { id: "landmark", label: "Landmark", icon: "Landmark", color: "#F97316", hasDishes: false },
  { id: "temple", label: "Temple", icon: "Church", color: "#C62828", hasDishes: false },
  { id: "beach", label: "Beach", icon: "Umbrella", color: "#06B6D4", hasDishes: false },
  { id: "restaurant", label: "Restaurant", icon: "UtensilsCrossed", color: "#22C55E", hasDishes: true },
  { id: "market", label: "Market", icon: "ShoppingBag", color: "#A855F7", hasDishes: false },
  { id: "museum", label: "Museum", icon: "Palette", color: "#92400E", hasDishes: false },
  { id: "nature", label: "Nature", icon: "Leaf", color: "#34D399", hasDishes: false },
  { id: "cafe", label: "Café", icon: "Coffee", color: "#6366F1", hasDishes: true },
  { id: "nightlife", label: "Nightlife", icon: "Moon", color: "#EC4899", hasDishes: false },
];

export function getCategoryConfig(id: string): CategoryConfig {
  return categories.find((c) => c.id === id) || categories[0];
}
