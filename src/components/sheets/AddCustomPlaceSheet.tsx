"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ThumbnailPicker } from "@/components/ui/ThumbnailPicker";
import { createCustomPlace } from "@/db/hooks";
import { isCustomCityRef, parseCustomCityRef } from "@/lib/customRefs";
import { categories } from "@/data/categories";

const LocationPickerMap = dynamic(
  () =>
    import("@/components/map/LocationPickerMap").then((mod) => mod.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-surface-bg animate-pulse" /> }
);

interface AddCustomPlaceSheetProps {
  open: boolean;
  onClose: () => void;
  cityRef: string;
  cityCoords?: { lat: number; lng: number };
}

export function AddCustomPlaceSheet({ open, onClose, cityRef, cityCoords }: AddCustomPlaceSheetProps) {
  const [step, setStep] = useState<"form" | "location">("form");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("landmark");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const isCustomCity = isCustomCityRef(cityRef);
  const customCityId = isCustomCity ? parseCustomCityRef(cityRef) : undefined;

  const handleNext = () => {
    if (!name.trim()) return;
    setStep("location");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCustomPlace({
      name: name.trim(),
      categoryRawValue: category,
      placeDescription: description.trim(),
      address: address.trim(),
      cityId: isCustomCity ? "" : cityRef,
      customCityId,
      isCustomCity,
      lat: coords?.lat,
      lng: coords?.lng,
      thumbnail: thumbnail ?? undefined,
      recommendedDishes: [],
      createdAt: new Date().toISOString(),
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("form");
    setName("");
    setCategory("landmark");
    setDescription("");
    setAddress("");
    setCoords(null);
    setThumbnail(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={resetAndClose} title={step === "form" ? "Add Place" : "Mark Location"}>
      {step === "form" ? (
        <div className="space-y-4">
          <ThumbnailPicker value={thumbnail} onChange={setThumbnail} />
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Place Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Floating Market"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: category === cat.id ? cat.color + "20" : "transparent",
                    borderColor: category === cat.id ? cat.color + "50" : "#30363D",
                    color: category === cat.id ? cat.color : "#8B949E",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this place..."
              rows={2}
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Address (optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <button
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-1 text-xs text-text-secondary"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <LocationPickerMap
            value={coords}
            onChange={setCoords}
            initialCenter={cityCoords}
          />
          <button
            onClick={handleCreate}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
            disabled={!coords}
          >
            Save Place
          </button>
        </div>
      )}
    </Modal>
  );
}
