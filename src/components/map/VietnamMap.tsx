"use client";

import { useState, useRef, useEffect } from "react";
import Map, { type MapRef } from "react-map-gl/maplibre";
import { ArrowLeft } from "lucide-react";
import { cities, getCityById } from "@/data/cities";
import { getPlacesByCity } from "@/data/places";
import { cityCoordinates } from "@/data/coordinates";
import { CityMarker } from "./CityMarker";
import { PlaceMarker } from "./PlaceMarker";
import "maplibre-gl/dist/maplibre-gl.css";

const VIETNAM_CENTER = { lng: 106.0, lat: 16.0 };
const OVERVIEW_ZOOM = 6;
const CITY_ZOOM = 14;

export function VietnamMap() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const selectedCity = selectedCityId ? getCityById(selectedCityId) : null;
  const cityPlaces = selectedCityId ? getPlacesByCity(selectedCityId) : [];

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedCityId) {
      const coords = cityCoordinates[selectedCityId];
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
  }, [selectedCityId]);

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
        {!selectedCityId &&
          cities.map((city) => (
            <CityMarker
              key={city.id}
              city={city}
              onClick={setSelectedCityId}
            />
          ))}

        {selectedCityId &&
          cityPlaces.map((place) => (
            <PlaceMarker key={place.id} place={place} />
          ))}
      </Map>

      {selectedCity && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-3 rounded-xl bg-card-bg/90 backdrop-blur-lg px-3 py-2.5 border border-white/10">
          <button
            onClick={() => setSelectedCityId(null)}
            className="flex items-center justify-center rounded-lg bg-surface-bg p-2 text-white active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-white">
            {selectedCity.name}
          </span>
          <span className="text-xs text-text-secondary">
            {cityPlaces.length} places
          </span>
        </div>
      )}
    </div>
  );
}
