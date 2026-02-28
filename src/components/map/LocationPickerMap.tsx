"use client";

import { useState, useRef, useCallback } from "react";
import Map, { Marker, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

const VIETNAM_CENTER = { lng: 106.0, lat: 16.0 };

interface LocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
}

export function LocationPickerMap({ value, onChange, initialCenter }: LocationPickerMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [latInput, setLatInput] = useState(value?.lat?.toString() ?? "");
  const [lngInput, setLngInput] = useState(value?.lng?.toString() ?? "");

  const center = value ?? initialCenter ?? VIETNAM_CENTER;
  const zoom = value || initialCenter ? 12 : 6;

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const { lat, lng } = e.lngLat;
      onChange({ lat, lng });
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
    },
    [onChange]
  );

  const trySubmitCoords = useCallback(
    (latStr: string, lngStr: string) => {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng)) return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
      onChange({ lat, lng });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, duration: 800 });
    },
    [onChange]
  );

  const handleLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLatInput(val);
      trySubmitCoords(val, lngInput);
    },
    [lngInput, trySubmitCoords]
  );

  const handleLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLngInput(val);
      trySubmitCoords(latInput, val);
    },
    [latInput, trySubmitCoords]
  );

  return (
    <div>
      <p className="mb-2 text-xs text-text-secondary">
        Tap on the map or enter coordinates below
      </p>
      <div className="h-64 w-full overflow-hidden rounded-xl" data-vaul-no-drag>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: center.lng,
            latitude: center.lat,
            zoom,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="/map-style-zenly.json"
          attributionControl={false}
          onClick={handleMapClick}
        >
          {value && (
            <Marker longitude={value.lng} latitude={value.lat} anchor="bottom">
              <div className="flex flex-col items-center">
                <MapPin size={28} className="text-brand-coral" fill="#FF6B6B" />
              </div>
            </Marker>
          )}
        </Map>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-medium text-text-secondary mb-0.5 block">
            Latitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={latInput}
            onChange={handleLatChange}

            placeholder="e.g. 16.0471"
            className="w-full rounded-lg bg-surface-bg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-secondary mb-0.5 block">
            Longitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={lngInput}
            onChange={handleLngChange}

            placeholder="e.g. 108.2068"
            className="w-full rounded-lg bg-surface-bg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
          />
        </div>
      </div>
    </div>
  );
}
