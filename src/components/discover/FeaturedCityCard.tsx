import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { City } from "@/types/city";
import { getCityGradient } from "@/lib/theme";
import { getPlacesByCity } from "@/data/places";

interface FeaturedCityCardProps {
  city: City;
}

export function FeaturedCityCard({ city }: FeaturedCityCardProps) {
  const [gradFrom, gradTo] = getCityGradient(city.gradientIndex);
  const placeCount = getPlacesByCity(city.id).length;

  return (
    <Link href={`/discover/${city.id}`} className="block">
      <div className="relative h-52 overflow-hidden rounded-2xl">
        <Image
          src={`/images/cities/${city.imageAsset}.png`}
          alt={city.name}
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${gradFrom}E6 0%, ${gradFrom}80 40%, transparent 100%)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <MapPin size={12} className="text-white/70" />
            <span className="text-xs text-white/70">{city.region}</span>
          </div>
          <h2 className="text-2xl font-bold">{city.name}</h2>
          <p className="mt-0.5 text-xs text-white/80">{placeCount} places to visit</p>
        </div>
      </div>
    </Link>
  );
}
