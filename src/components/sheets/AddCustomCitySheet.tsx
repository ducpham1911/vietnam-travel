"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createCustomCity } from "@/db/hooks";

const LocationPickerMap = dynamic(
  () =>
    import("@/components/map/LocationPickerMap").then((mod) => mod.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-surface-bg animate-pulse" /> }
);

interface AddCustomCitySheetProps {
  open: boolean;
  onClose: () => void;
  prefillName?: string;
}

export function AddCustomCitySheet({ open, onClose, prefillName = "" }: AddCustomCitySheetProps) {
  const [step, setStep] = useState<"form" | "location">("form");
  const [name, setName] = useState(prefillName);
  const [region, setRegion] = useState("Vietnam");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleNext = () => {
    if (!name.trim()) return;
    setStep("location");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCustomCity({
      name: name.trim(),
      region: region.trim() || "Vietnam",
      cityDescription: description.trim(),
      lat: coords?.lat,
      lng: coords?.lng,
      createdAt: new Date().toISOString(),
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("form");
    setName("");
    setRegion("Vietnam");
    setDescription("");
    setCoords(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={resetAndClose} title={step === "form" ? "Add Custom City" : "Mark Location"}>
      {step === "form" ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">City Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cần Thơ"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Vietnam"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this city..."
              rows={3}
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-brand-gold/50"
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
          <LocationPickerMap value={coords} onChange={setCoords} />
          <button
            onClick={handleCreate}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
            disabled={!coords}
          >
            Save City
          </button>
        </div>
      )}
    </Modal>
  );
}
