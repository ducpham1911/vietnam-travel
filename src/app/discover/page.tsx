"use client";

import { useState } from "react";
import { Plus, MapPin, Trash2, ExternalLink } from "lucide-react";
import { cities } from "@/data/cities";
import { FeaturedCityCard } from "@/components/discover/FeaturedCityCard";
import { CityCard } from "@/components/discover/CityCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { AddCustomCitySheet } from "@/components/sheets/AddCustomCitySheet";
import { useCustomCities, deleteCustomCity } from "@/db/hooks";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [showAddCity, setShowAddCity] = useState(false);
  const customCities = useCustomCities();

  const featured = cities[0]; // Hà Nội
  const remaining = cities.slice(1);

  const searchLower = search.toLowerCase();
  const filteredSeed = search
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.region.toLowerCase().includes(searchLower)
      )
    : null;

  const filteredCustom = search
    ? customCities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.region.toLowerCase().includes(searchLower)
      )
    : customCities;

  const noResults = filteredSeed && filteredSeed.length === 0 && filteredCustom.length === 0;

  return (
    <div className="px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-text-secondary">Explore the beauty of Vietnam</p>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search cities..."
        />
      </div>

      {filteredSeed ? (
        <div>
          {noResults ? (
            <div className="py-12 text-center">
              <p className="text-text-secondary mb-4">No cities found</p>
              <button
                onClick={() => setShowAddCity(true)}
                className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-semibold"
              >
                Add &quot;{search}&quot; as custom city
              </button>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(search + " Vietnam travel")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-surface-bg px-5 py-2.5 text-sm font-semibold text-text-secondary"
              >
                Discover on Google
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {filteredSeed.map((city) => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
              {filteredCustom.length > 0 && (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-text-secondary">Your Cities</h2>
                  {filteredCustom.map((cc) => (
                    <CustomCityRow key={cc.id} city={cc} onDelete={() => deleteCustomCity(cc.id!)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <FeaturedCityCard city={featured} />
          </div>

          <h2 className="mb-3 text-lg font-semibold">All Cities</h2>
          <div className="grid grid-cols-2 gap-3">
            {remaining.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>

          {/* Custom Cities Section */}
          {customCities.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">Your Cities</h2>
              <div className="flex flex-col gap-2">
                {customCities.map((cc) => (
                  <CustomCityRow key={cc.id} city={cc} onDelete={() => deleteCustomCity(cc.id!)} />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowAddCity(true)}
            className="mt-4 mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-bg py-3 text-sm font-medium text-text-secondary"
          >
            <Plus size={16} />
            Add Custom City
          </button>
        </>
      )}

      <AddCustomCitySheet
        open={showAddCity}
        onClose={() => setShowAddCity(false)}
        prefillName={noResults ? search : ""}
      />
    </div>
  );
}

function CustomCityRow({
  city,
  onDelete,
}: {
  city: { id?: number; name: string; region: string; cityDescription: string };
  onDelete: () => void;
}) {
  return (
    <div className="card-style flex items-center gap-3 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-coral/20">
        <MapPin size={16} className="text-brand-coral" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">{city.name}</h3>
        <p className="text-xs text-text-secondary">{city.region}</p>
      </div>
      <button onClick={onDelete} className="p-1">
        <Trash2 size={14} className="text-text-tertiary" />
      </button>
    </div>
  );
}
