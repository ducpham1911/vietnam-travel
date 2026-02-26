"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DayPlan } from "@/types/trip";
import { formatDate } from "@/lib/utils";

interface DayCardProps {
  dayPlan: DayPlan;
  tripId: number;
  placeCount: number;
  visitedCount: number;
}

export function DayCard({ dayPlan, tripId, placeCount, visitedCount }: DayCardProps) {
  const hasPlaces = placeCount > 0;

  return (
    <Link href={`/trips/${tripId}/days/${dayPlan.dayNumber}`} className="block">
      <div className="card-style flex items-center gap-3 p-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            hasPlaces ? "bg-brand-teal/20 text-brand-teal" : "bg-surface-bg text-text-tertiary"
          }`}
        >
          {dayPlan.dayNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">Day {dayPlan.dayNumber}</span>
            <span className="text-xs text-text-secondary">
              {formatDate(dayPlan.date, "long").split(",")[0]}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {hasPlaces ? (
              <>
                <span className="text-xs text-text-secondary">{placeCount} places</span>
                {visitedCount > 0 && (
                  <span className="text-xs text-brand-teal">
                    {visitedCount} visited
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-text-tertiary">No places planned</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-text-tertiary" />
      </div>
    </Link>
  );
}
