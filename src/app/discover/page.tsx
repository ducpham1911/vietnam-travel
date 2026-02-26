"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { cities } from "@/data/cities";
import { getPlacesByCity } from "@/data/places";
import { FeaturedCityCard } from "@/components/discover/FeaturedCityCard";
import { CityCard } from "@/components/discover/CityCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { AddCustomCitySheet } from "@/components/sheets/AddCustomCitySheet";
import { useCustomCities, deleteCustomCity } from "@/db/hooks";
import { resolveStaticCity, resolveCustomCityObj, ResolvedCity } from "@/lib/resolvers";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showAddCity, setShowAddCity] = useState(false);
  const [deletingCity, setDeletingCity] = useState<ResolvedCity | null>(null);
  const customCities = useCustomCities();
  const [customPlaceCounts, setCustomPlaceCounts] = useState<Record<string, number>>({});

  // Fetch custom place counts — stabilize dep with serialized IDs
  const customCityIds = customCities.map((c) => c.id).join(",");
  useEffect(() => {
    if (!user || !customCityIds) return;
    async function fetchCounts() {
      const ids = customCityIds.split(",");
      const counts: Record<string, number> = {};
      const supabase = getSupabaseBrowserClient();
      for (const id of ids) {
        const { count } = await supabase
          .from("custom_places")
          .select("*", { count: "exact", head: true })
          .eq("custom_city_id", id);
        counts[id] = count ?? 0;
      }
      setCustomPlaceCounts(counts);
    }
    fetchCounts();
  }, [customCityIds, user]);

  // Build unified list
  const allCities: ResolvedCity[] = [
    ...cities.map(resolveStaticCity),
    ...customCities.map(resolveCustomCityObj),
  ];

  const featured = allCities[0]; // Ha Noi
  const remaining = allCities.slice(1);

  const searchLower = search.toLowerCase();
  const filtered = search
    ? allCities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.region.toLowerCase().includes(searchLower)
      )
    : null;

  const noResults = filtered && filtered.length === 0;

  const getPlaceCount = (city: ResolvedCity): number => {
    if (city.isCustom && city.customId) {
      return customPlaceCounts[city.customId] ?? 0;
    }
    return getPlacesByCity(city.id).length;
  };

  const handleDeleteCustomCity = async () => {
    if (deletingCity?.customId) {
      await deleteCustomCity(deletingCity.customId);
    }
    setDeletingCity(null);
  };

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

      {filtered ? (
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
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((city) => (
                <div key={city.id} className="relative">
                  <CityCard city={city} placeCount={getPlaceCount(city)} />
                  {city.isCustom && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingCity(city);
                      }}
                      className="absolute top-1.5 left-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
                    >
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <FeaturedCityCard city={featured} placeCount={getPlaceCount(featured)} />
          </div>

          <h2 className="mb-3 text-lg font-semibold">All Cities</h2>
          <div className="grid grid-cols-2 gap-3">
            {remaining.map((city) => (
              <div key={city.id} className="relative">
                <CityCard city={city} placeCount={getPlaceCount(city)} />
                {city.isCustom && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingCity(city);
                    }}
                    className="absolute top-1.5 left-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
                  >
                    <Trash2 size={11} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

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

      <ConfirmDialog
        open={!!deletingCity}
        onClose={() => setDeletingCity(null)}
        onConfirm={handleDeleteCustomCity}
        title="Delete City"
        message={`Are you sure you want to delete "${deletingCity?.name}"? This will also remove all custom places in this city.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
