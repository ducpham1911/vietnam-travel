"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CategoryChip } from "@/components/discover/CategoryChip";
import { getCategoryConfig } from "@/data/categories";
import { getCategoryColor } from "@/lib/theme";
import { usePlacesForCityRef } from "@/db/hooks";
import { addSharedPlaceVisit } from "@/db/shared-hooks";
import { useAuth } from "@/contexts/AuthContext";
import { ResolvedPlace } from "@/lib/resolvers";
import { PlaceCategory } from "@/types/city";

interface AddPlaceToSharedDaySheetProps {
  open: boolean;
  onClose: () => void;
  dayPlanId: string;
  cityIds: string[];
  nextOrderIndex: number;
}

export function AddPlaceToSharedDaySheet({
  open,
  onClose,
  dayPlanId,
  cityIds,
  nextOrderIndex,
}: AddPlaceToSharedDaySheetProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedPlace, setSelectedPlace] = useState<ResolvedPlace | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [useTime, setUseTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  // Gather places from all city refs
  const city0Places = usePlacesForCityRef(cityIds[0] ?? "");
  const city1Places = usePlacesForCityRef(cityIds[1] ?? "");
  const city2Places = usePlacesForCityRef(cityIds[2] ?? "");
  const city3Places = usePlacesForCityRef(cityIds[3] ?? "");
  const city4Places = usePlacesForCityRef(cityIds[4] ?? "");

  const allPlaces: ResolvedPlace[] = [];
  const seen = new Set<string>();
  for (const list of [city0Places, city1Places, city2Places, city3Places, city4Places]) {
    for (const p of list) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        allPlaces.push(p);
      }
    }
  }

  const categories = Array.from(new Set(allPlaces.map((p) => p.category))).sort();
  const filteredPlaces = selectedCategory
    ? allPlaces.filter((p) => p.category === selectedCategory)
    : allPlaces;

  const handleSelectPlace = (place: ResolvedPlace) => {
    setSelectedPlace(place);
    setSelectedDishes([]);
    setStep("configure");
  };

  const handleAdd = async () => {
    if (!selectedPlace) return;
    const today = new Date().toISOString().split("T")[0];
    await addSharedPlaceVisit({
      day_plan_id: dayPlanId,
      place_id: selectedPlace.id,
      order_index: nextOrderIndex,
      start_time: useTime ? `${today}T${startTime}:00` : null,
      end_time: useTime ? `${today}T${endTime}:00` : null,
      selected_dishes: selectedDishes,
      added_by: user?.id ?? null,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("select");
    setSelectedPlace(null);
    setSelectedCategory(null);
    setUseTime(false);
    setSelectedDishes([]);
    onClose();
  };

  const toggleDish = (dish: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dish) ? prev.filter((d) => d !== dish) : [...prev, dish]
    );
  };

  return (
    <Modal open={open} onClose={resetAndClose} title={step === "select" ? "Add Place" : "Configure"}>
      {step === "select" ? (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${
                !selectedCategory
                  ? "border-brand-gold/40 bg-brand-gold/20 text-brand-gold"
                  : "border-surface-bg text-text-secondary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                categoryId={cat}
                isSelected={selectedCategory === cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {filteredPlaces.map((place) => {
              const config = getCategoryConfig(place.category);
              const color = getCategoryColor(place.category);
              return (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="flex items-center gap-3 rounded-xl bg-surface-bg p-3 text-left"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ backgroundColor: color + "20", color }}
                  >
                    {config.label[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{place.name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {config.label}
                      {place.isCustom && " (custom)"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setStep("select")}
            className="flex items-center gap-1 text-xs text-text-secondary"
          >
            <ArrowLeft size={12} /> Back to places
          </button>

          <div className="card-style p-3">
            <p className="text-sm font-semibold">{selectedPlace?.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {getCategoryConfig(selectedPlace?.category ?? "landmark").label}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useTime}
                onChange={(e) => setUseTime(e.target.checked)}
                className="accent-brand-teal"
              />
              Set time range
            </label>
            {useTime && (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-xl bg-surface-bg px-3 py-2 text-sm outline-none"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-xl bg-surface-bg px-3 py-2 text-sm outline-none"
                />
              </div>
            )}
          </div>

          {selectedPlace && selectedPlace.recommendedDishes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Select dishes</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlace.recommendedDishes.map((dish) => {
                  const isSelected = selectedDishes.includes(dish);
                  const color = getCategoryColor(selectedPlace.category);
                  return (
                    <button
                      key={dish}
                      onClick={() => toggleDish(dish)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all"
                      style={{
                        backgroundColor: isSelected ? color + "25" : "#21262D",
                        color: isSelected ? color : "#8B949E",
                      }}
                    >
                      {isSelected && <Check size={10} />}
                      {dish}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold"
          >
            Add to Day
          </button>
        </div>
      )}
    </Modal>
  );
}
