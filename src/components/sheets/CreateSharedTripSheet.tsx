"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cities } from "@/data/cities";
import { getCityGradient } from "@/lib/theme";
import { useCustomCities } from "@/db/hooks";
import { resolveStaticCity, resolveCustomCityObj } from "@/lib/resolvers";
import { createSharedTrip } from "@/db/shared-hooks";
import { useAuth } from "@/contexts/AuthContext";

interface CreateSharedTripSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSharedTripSheet({ open, onClose }: CreateSharedTripSheetProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const customCities = useCustomCities();

  const allCities = [
    ...cities.map(resolveStaticCity),
    ...customCities.map(resolveCustomCityObj),
  ];

  const toggleCity = (id: string) => {
    setSelectedCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    await createSharedTrip({
      name: name.trim(),
      start_date: startDate,
      end_date: endDate,
      notes,
      city_ids: selectedCities,
      owner_id: user.id,
    });
    setName("");
    setSelectedCities([]);
    setNotes("");
    setCreating(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Shared Trip">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">
            Trip Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Vietnam Adventure"
            className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary mb-2 block">
            Cities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allCities.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              const [grad] = getCityGradient(city.gradientIndex);
              return (
                <button
                  key={city.id}
                  onClick={() => toggleCity(city.id)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-all"
                  style={{
                    backgroundColor: isSelected ? grad + "20" : "#21262D",
                    borderWidth: 1,
                    borderColor: isSelected ? grad + "50" : "transparent",
                  }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: grad + "30" }}
                  >
                    {isSelected && <Check size={12} style={{ color: grad }} />}
                  </span>
                  <span className={isSelected ? "font-medium" : "text-text-secondary"}>
                    {city.name}
                  </span>
                  {city.isCustom && (
                    <span className="ml-auto text-[9px] text-text-tertiary">custom</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any travel notes..."
            rows={2}
            className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-brand-gold/50"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || creating}
          className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
        >
          {creating ? "Creating..." : "Create Shared Trip"}
        </button>
      </div>
    </Modal>
  );
}
