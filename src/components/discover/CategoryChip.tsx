"use client";

import { getCategoryConfig } from "@/data/categories";
import {
  Landmark,
  Church,
  Umbrella,
  UtensilsCrossed,
  ShoppingBag,
  Palette,
  Leaf,
  Coffee,
  Moon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Landmark,
  Church,
  Umbrella,
  UtensilsCrossed,
  ShoppingBag,
  Palette,
  Leaf,
  Coffee,
  Moon,
};

interface CategoryChipProps {
  categoryId: string;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryChip({ categoryId, isSelected, onClick }: CategoryChipProps) {
  const config = getCategoryConfig(categoryId);
  const Icon = iconMap[config.icon];

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
      style={{
        backgroundColor: isSelected ? config.color + "20" : "transparent",
        color: isSelected ? config.color : "#8B949E",
        border: `1px solid ${isSelected ? config.color + "40" : "#21262D"}`,
      }}
    >
      {Icon && <Icon size={13} />}
      {config.label}
    </button>
  );
}
