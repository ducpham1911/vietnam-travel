"use client";

import dynamic from "next/dynamic";

const VietnamMap = dynamic(
  () => import("@/components/map/VietnamMap").then((mod) => mod.VietnamMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Loading map...</span>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="h-[calc(100dvh-5rem)]">
      <VietnamMap />
    </div>
  );
}
