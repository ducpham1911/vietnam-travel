"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { getCategoryConfig } from "@/data/categories";
import { getCategoryColor } from "@/lib/theme";
import { StarRating } from "@/components/discover/StarRating";
import { PriceLevel } from "@/components/discover/PriceLevel";
import { AddPlaceToTripSheet } from "@/components/sheets/AddPlaceToTripSheet";
import { useTrips } from "@/db/hooks";
import { resolvePlaceRef, resolveCityRef } from "@/lib/resolvers";
import { useLiveQuery } from "dexie-react-hooks";
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

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Landmark, Church, Umbrella, UtensilsCrossed, ShoppingBag, Palette, Leaf, Coffee, Moon,
};

export default function PlaceDetailPage() {
  const params = useParams<{ placeId: string; cityId: string }>();
  const placeId = decodeURIComponent(params.placeId);
  const cityId = decodeURIComponent(params.cityId);
  const router = useRouter();
  const [showAddToTrip, setShowAddToTrip] = useState(false);
  const trips = useTrips();

  const place = useLiveQuery(
    () => resolvePlaceRef(placeId).then((p) => p ?? null),
    [placeId]
  );
  const city = useLiveQuery(
    () => resolveCityRef(cityId).then((c) => c ?? null),
    [cityId]
  );

  if (place === undefined || city === undefined) {
    return <div className="p-4 text-text-secondary">Loading...</div>;
  }
  if (!place || !city) return <div className="p-4">Place not found</div>;

  const config = getCategoryConfig(place.category);
  const color = getCategoryColor(place.category);
  const Icon = iconMap[config.icon];

  return (
    <div>
      {/* Hero */}
      <div
        className="relative h-56"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
        }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon size={48} className="mb-3 text-white/30" />}
          <span
            className="mb-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {config.label}
          </span>
          <h1 className="text-2xl font-bold text-center px-6">{place.name}</h1>
          <div className="mt-1 flex items-center gap-1">
            <MapPin size={12} className="text-white/60" />
            <span className="text-xs text-white/60">{city.name}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 pb-4">
        {/* Rating & Price — only for static places */}
        {place.rating !== null && place.priceLevel !== null && (
          <div className="card-style p-4 flex items-center justify-between">
            <StarRating rating={place.rating} size={16} />
            <PriceLevel level={place.priceLevel} />
          </div>
        )}

        {/* About */}
        {place.description && (
          <div className="card-style p-4">
            <h2 className="text-sm font-semibold mb-2 text-text-secondary">About</h2>
            <p className="text-sm leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Recommended Dishes */}
        {place.recommendedDishes.length > 0 && (
          <div className="card-style p-4">
            <h2 className="text-sm font-semibold mb-3 text-text-secondary">
              Recommended Dishes
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {place.recommendedDishes.map((dish) => (
                <div
                  key={dish}
                  className="rounded-lg px-3 py-2 text-xs font-medium"
                  style={{ backgroundColor: color + "15", color }}
                >
                  {dish}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address */}
        {place.address && (
          <div className="card-style p-4 flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-text-secondary" />
            <div>
              <h2 className="text-sm font-semibold mb-0.5 text-text-secondary">Address</h2>
              <p className="text-sm">{place.address}</p>
            </div>
          </div>
        )}

        {/* Add to Trip button */}
        {trips.length > 0 && (
          <button
            onClick={() => setShowAddToTrip(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            }}
          >
            <Plus size={16} />
            Add to My Trip
          </button>
        )}
      </div>

      <AddPlaceToTripSheet
        open={showAddToTrip}
        onClose={() => setShowAddToTrip(false)}
        placeId={place.id}
        placeName={place.name}
      />
    </div>
  );
}
