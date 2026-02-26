"use client";

import { Marker } from "react-map-gl/maplibre";
import { City } from "@/types/city";
import { cityCoordinates } from "@/data/coordinates";
import { getCityGradient } from "@/lib/theme";

interface CityMarkerProps {
  city: City;
  onClick: (cityId: string) => void;
}

export function CityMarker({ city, onClick }: CityMarkerProps) {
  const coords = cityCoordinates[city.id];
  if (!coords) return null;

  const [color] = getCityGradient(city.gradientIndex);

  return (
    <Marker
      longitude={coords.lng}
      latitude={coords.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(city.id);
      }}
    >
      <div className="flex flex-col items-center cursor-pointer">
        <div
          className="w-5 h-5 rounded-full border-[2.5px] border-white"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}80, 0 2px 6px rgba(0,0,0,0.3)`,
          }}
        />
        <span className="mt-1 text-[11px] font-semibold text-[#5C4A5A] whitespace-nowrap drop-shadow-[0_1px_2px_rgba(255,248,240,0.8)]">
          {city.name}
        </span>
      </div>
    </Marker>
  );
}
