import Link from "next/link";
import { ResolvedPlace } from "@/lib/resolvers";
import { getCategoryConfig } from "@/data/categories";
import { StarRating } from "./StarRating";
import { PriceLevel } from "./PriceLevel";
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
  UtensilsCrossed as Dish,
} from "lucide-react";

const iconMap: Record<string, typeof Landmark> = {
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

interface PlaceCardProps {
  place: ResolvedPlace;
  cityId: string;
}

export function PlaceCard({ place, cityId }: PlaceCardProps) {
  const config = getCategoryConfig(place.category);
  const Icon = iconMap[config.icon];

  return (
    <Link href={`/discover/${cityId}/places/${place.id}`} className="block">
      <div className="card-style flex gap-3 p-3">
        {place.thumbnail ? (
          <img
            src={place.thumbnail}
            alt={place.name}
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: config.color + "20" }}
          >
            {Icon && <Icon size={20} color={config.color} />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight">{place.name}</h3>
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: config.color + "20", color: config.color }}
            >
              {config.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">{place.description}</p>
          <div className="mt-2 flex items-center gap-3">
            {place.rating !== null && <StarRating rating={place.rating} size={11} />}
            {place.priceLevel !== null && <PriceLevel level={place.priceLevel} />}
            {place.recommendedDishes.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <Dish size={10} />
                {place.recommendedDishes.length} dishes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
