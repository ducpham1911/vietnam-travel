"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { getCityGradient } from "@/lib/theme";
import { PlaceCard } from "@/components/discover/PlaceCard";
import { CategoryChip } from "@/components/discover/CategoryChip";
import { PlaceCategory } from "@/types/city";
import { isCustomCityRef } from "@/lib/customRefs";
import { resolveCityRef, ResolvedCity } from "@/lib/resolvers";
import { usePlacesForCityRef } from "@/db/hooks";
import { AddCustomPlaceSheet } from "@/components/sheets/AddCustomPlaceSheet";

export default function CityDetailPage() {
  const params = useParams<{ cityId: string }>();
  const cityId = decodeURIComponent(params.cityId);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [city, setCity] = useState<ResolvedCity | null | undefined>(undefined);

  useEffect(() => {
    resolveCityRef(cityId).then((c) => setCity(c ?? null));
  }, [cityId]);

  const allPlaces = usePlacesForCityRef(cityId);

  if (city === undefined) return <div className="p-4 text-text-secondary">Loading...</div>;
  if (city === null) return <div className="p-4">City not found</div>;

  const categories = Array.from(new Set(allPlaces.map((p) => p.category))).sort();
  const filteredPlaces = selectedCategory
    ? allPlaces.filter((p) => p.category === selectedCategory)
    : allPlaces;

  const [gradFrom] = getCityGradient(city.gradientIndex);
  const isCustom = isCustomCityRef(cityId);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64">
        {city.thumbnail ? (
          <img
            src={city.thumbnail}
            alt={city.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : city.imageAsset ? (
          <Image
            src={`/images/cities/${city.imageAsset}.png`}
            alt={city.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${gradFrom}, ${gradFrom}80)`,
            }}
          >
            <MapPin size={48} className="text-white/20" />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${gradFrom}E6 0%, ${gradFrom}99 50%, transparent 100%)`,
          }}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <MapPin size={12} className="text-white/70" />
            <span className="text-xs text-white/70">{city.region}</span>
          </div>
          <h1 className="text-3xl font-bold">{city.name}</h1>
          <p className="mt-1 text-sm text-white/80 line-clamp-2">{city.description}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-white/60">{allPlaces.length} places</span>
            <span className="text-xs text-white/60">{categories.length} categories</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap border transition-all ${
            !selectedCategory
              ? "border-brand-gold/40 bg-brand-gold/20 text-brand-gold"
              : "border-surface-bg text-text-secondary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            categoryId={cat}
            isSelected={selectedCategory === cat}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? null : cat)
            }
          />
        ))}
      </div>

      {/* Places List */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} cityId={cityId} />
        ))}

        {/* Add Place button for custom cities */}
        {isCustom && (
          <button
            onClick={() => setShowAddPlace(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-bg py-3 text-sm font-medium text-text-secondary"
          >
            <Plus size={16} />
            Add Place
          </button>
        )}
      </div>

      {isCustom && (
        <AddCustomPlaceSheet
          open={showAddPlace}
          onClose={() => setShowAddPlace(false)}
          cityRef={cityId}
          cityCoords={city.lat && city.lng ? { lat: city.lat, lng: city.lng } : undefined}
        />
      )}
    </div>
  );
}
