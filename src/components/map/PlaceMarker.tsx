"use client";

import { useState } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import Link from "next/link";
import { Place } from "@/types/city";
import { placeCoordinates } from "@/data/coordinates";
import { getCategoryColor } from "@/lib/theme";
import { getCategoryConfig } from "@/data/categories";

interface PlaceMarkerProps {
  place: Place;
}

export function PlaceMarker({ place }: PlaceMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);

  const coords = placeCoordinates[place.id];
  if (!coords) return null;

  const color = getCategoryColor(place.category);
  const category = getCategoryConfig(place.category);

  return (
    <>
      <Marker
        longitude={coords.lng}
        latitude={coords.lat}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setShowPopup(true);
        }}
      >
        <div
          className="w-3 h-3 rounded-full border-2 border-white cursor-pointer"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}80, 0 1px 4px rgba(0,0,0,0.3)`,
          }}
        />
      </Marker>

      {showPopup && (
        <Popup
          longitude={coords.lng}
          latitude={coords.lat}
          anchor="bottom"
          offset={10}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          className="map-popup"
        >
          <div className="min-w-[180px]">
            <h3 className="text-sm font-semibold text-white mb-1">
              {place.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                style={{ background: color }}
              >
                {category.label}
              </span>
              <span className="text-xs text-text-secondary">
                {"★".repeat(Math.round(place.rating))} {place.rating}
              </span>
            </div>
            <Link
              href={`/discover/${place.cityId}/places/${place.id}`}
              className="inline-block text-xs font-medium text-brand-gold hover:underline"
            >
              View Details →
            </Link>
          </div>
        </Popup>
      )}
    </>
  );
}
