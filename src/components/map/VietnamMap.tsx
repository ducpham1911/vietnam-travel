"use client";

import { useState, useRef, useEffect } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/maplibre";
import { ArrowLeft } from "lucide-react";
import { cities, getCityById } from "@/data/cities";
import { getPlacesByCity } from "@/data/places";
import { cityCoordinates } from "@/data/coordinates";
import { CityMarker } from "./CityMarker";
import { PlaceMarker } from "./PlaceMarker";
import { useCustomCities, useCustomPlaces } from "@/db/hooks";
import { getCityGradient, getCategoryColor } from "@/lib/theme";
import { getCategoryConfig } from "@/data/categories";
import { toCustomCityRef, isCustomCityRef, parseCustomCityRef } from "@/lib/customRefs";
import { resolveCustomPlaceObj } from "@/lib/resolvers";
import type { PlaceCategory } from "@/types/city";
import "maplibre-gl/dist/maplibre-gl.css";

const VIETNAM_CENTER = { lng: 106.0, lat: 16.0 };
const OVERVIEW_ZOOM = 6;
const CITY_ZOOM = 14;

export function VietnamMap() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const customCities = useCustomCities();
  const customCityId = selectedCityId && isCustomCityRef(selectedCityId)
    ? parseCustomCityRef(selectedCityId)
    : undefined;
  const customPlaces = useCustomPlaces(
    selectedCityId && !isCustomCityRef(selectedCityId) ? selectedCityId : undefined,
    customCityId
  );

  const selectedStaticCity = selectedCityId && !isCustomCityRef(selectedCityId)
    ? getCityById(selectedCityId)
    : null;
  const selectedCustomCity = selectedCityId && isCustomCityRef(selectedCityId)
    ? customCities.find((cc) => cc.id === parseCustomCityRef(selectedCityId))
    : null;

  const selectedCityName = selectedStaticCity?.name ?? selectedCustomCity?.name ?? "";

  const staticPlaces = selectedCityId && !isCustomCityRef(selectedCityId)
    ? getPlacesByCity(selectedCityId)
    : [];

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedCityId) {
      let coords: { lat: number; lng: number } | undefined;
      if (isCustomCityRef(selectedCityId)) {
        const cc = customCities.find((c) => c.id === parseCustomCityRef(selectedCityId));
        if (cc?.lat && cc?.lng) coords = { lat: cc.lat, lng: cc.lng };
      } else {
        coords = cityCoordinates[selectedCityId];
      }
      if (coords) {
        map.flyTo({
          center: [coords.lng, coords.lat],
          zoom: CITY_ZOOM,
          duration: 1200,
        });
      }
    } else {
      map.flyTo({
        center: [VIETNAM_CENTER.lng, VIETNAM_CENTER.lat],
        zoom: OVERVIEW_ZOOM,
        duration: 1200,
      });
    }
  }, [selectedCityId, customCities]);

  const totalPlaces = staticPlaces.length + customPlaces.length;

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: VIETNAM_CENTER.lng,
          latitude: VIETNAM_CENTER.lat,
          zoom: OVERVIEW_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="/map-style-zenly.json"
        attributionControl={false}
      >
        {/* Static city markers (overview) */}
        {!selectedCityId &&
          cities.map((city) => (
            <CityMarker
              key={city.id}
              city={city}
              onClick={setSelectedCityId}
            />
          ))}

        {/* Custom city markers (overview) */}
        {!selectedCityId &&
          customCities
            .filter((cc) => cc.lat && cc.lng)
            .map((cc) => {
              const ref = toCustomCityRef(cc.id);
              const hashCode = cc.id.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
              const [color] = getCityGradient(Math.abs(hashCode) % 10);
              return (
                <Marker
                  key={ref}
                  longitude={cc.lng!}
                  latitude={cc.lat!}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedCityId(ref);
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
                      {cc.name}
                    </span>
                  </div>
                </Marker>
              );
            })}

        {/* Static place markers (selected city) */}
        {selectedCityId &&
          staticPlaces.map((place) => (
            <PlaceMarker key={place.id} place={place} />
          ))}

        {/* Custom place markers (selected city) */}
        {selectedCityId &&
          customPlaces
            .filter((cp) => cp.lat && cp.lng)
            .map((cp) => {
              const color = getCategoryColor(cp.category_raw_value as PlaceCategory);
              const config = getCategoryConfig(cp.category_raw_value as PlaceCategory);
              const resolved = resolveCustomPlaceObj(cp);
              return (
                <Marker
                  key={`cp-${cp.id}`}
                  longitude={cp.lng!}
                  latitude={cp.lat!}
                  anchor="center"
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white cursor-pointer"
                    style={{
                      background: color,
                      boxShadow: `0 0 6px ${color}80, 0 1px 4px rgba(0,0,0,0.3)`,
                    }}
                    title={cp.name}
                  />
                </Marker>
              );
            })}
      </Map>

      {selectedCityId && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-3 rounded-xl bg-card-bg/90 backdrop-blur-lg px-3 py-2.5 border border-white/10">
          <button
            onClick={() => setSelectedCityId(null)}
            className="flex items-center justify-center rounded-lg bg-surface-bg p-2 text-white active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-white">
            {selectedCityName}
          </span>
          <span className="text-xs text-text-secondary">
            {totalPlaces} places
          </span>
        </div>
      )}
    </div>
  );
}
