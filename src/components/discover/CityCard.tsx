import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { City } from "@/types/city";
import { getCityGradient } from "@/lib/theme";
import { getPlacesByCity } from "@/data/places";

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const [gradFrom, gradTo] = getCityGradient(city.gradientIndex);
  const placeCount = getPlacesByCity(city.id).length;

  return (
    <Link href={`/discover/${city.id}`} className="block">
      <div className="card-style overflow-hidden">
        <div className="relative h-24">
          <Image
            src={`/images/cities/${city.imageAsset}.png`}
            alt={city.name}
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${gradFrom}CC 0%, transparent 60%)`,
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold">{city.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <MapPin size={10} className="text-text-secondary" />
            <span className="text-[11px] text-text-secondary">{city.region}</span>
          </div>
          <span className="mt-1.5 inline-block text-[10px] text-text-tertiary">
            {placeCount} places
          </span>
        </div>
      </div>
    </Link>
  );
}
