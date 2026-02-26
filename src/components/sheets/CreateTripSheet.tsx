"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cities } from "@/data/cities";
import { getCityGradient } from "@/lib/theme";
import { createTrip } from "@/db/hooks";
import { Check } from "lucide-react";

interface CreateTripSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTripSheet({ open, onClose }: CreateTripSheetProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleCity = (id: string) => {
    setSelectedCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createTrip({
      name: name.trim(),
      startDate,
      endDate,
      notes,
      cityIds: selectedCities,
      createdAt: new Date().toISOString(),
    });
    setName("");
    setSelectedCities([]);
    setNotes("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Trip">
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
            {cities.map((city) => {
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
          disabled={!name.trim()}
          className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
        >
          Create Trip
        </button>
      </div>
    </Modal>
  );
}
