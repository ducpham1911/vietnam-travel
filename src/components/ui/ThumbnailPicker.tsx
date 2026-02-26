"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { compressThumbnail } from "@/lib/imageUtils";

interface ThumbnailPickerProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function ThumbnailPicker({ value, onChange }: ThumbnailPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressThumbnail(file);
      onChange(dataUrl);
    } catch {
      // silently ignore invalid images
    }
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div>
      <label className="text-xs font-medium text-text-secondary mb-1 block">
        Photo (optional)
      </label>
      {value ? (
        <div className="relative w-full h-32 rounded-xl overflow-hidden">
          <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-bg bg-surface-bg/30 py-6 text-sm text-text-secondary"
        >
          <Camera size={18} />
          Add Photo
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
