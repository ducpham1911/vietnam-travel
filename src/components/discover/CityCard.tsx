import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { ResolvedCity } from "@/lib/resolvers";
import { getCityGradient } from "@/lib/theme";

interface CityCardProps {
  city: ResolvedCity;
  placeCount?: number;
}

export function CityCard({ city, placeCount }: CityCardProps) {
  const [gradFrom] = getCityGradient(city.gradientIndex);

  return (
    <Link href={`/discover/${city.id}`} className="block">
      <div className="card-style overflow-hidden">
        <div className="relative h-24">
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
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${gradFrom}, ${gradFrom}80)`,
              }}
            >
              <MapPin size={28} className="text-white/40" />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${gradFrom}CC 0%, transparent 60%)`,
            }}
          />
          {city.isCustom && (
            <span className="absolute top-1.5 right-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white/80 backdrop-blur-sm">
              Custom
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold">{city.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <MapPin size={10} className="text-text-secondary" />
            <span className="text-[11px] text-text-secondary">{city.region}</span>
          </div>
          {placeCount !== undefined && (
            <span className="mt-1.5 inline-block text-[10px] text-text-tertiary">
              {placeCount} places
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
