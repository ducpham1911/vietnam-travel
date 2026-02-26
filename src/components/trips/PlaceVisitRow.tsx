"use client";

import { ChevronUp, ChevronDown, Trash2, Circle, CheckCircle } from "lucide-react";
import { PlaceVisit } from "@/types/trip";
import { getCategoryConfig } from "@/data/categories";
import { getCategoryColor } from "@/lib/theme";
import { updatePlaceVisit, deletePlaceVisit, useResolvePlaceRef } from "@/db/hooks";
import { formatTimeRange } from "@/lib/utils";

interface PlaceVisitRowProps {
  visit: PlaceVisit;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisited?: (id: string, isVisited: boolean) => void;
  onDelete?: (id: string) => void;
}

export function PlaceVisitRow({ visit, isFirst, isLast, onMoveUp, onMoveDown, onToggleVisited, onDelete }: PlaceVisitRowProps) {
  const place = useResolvePlaceRef(visit.place_id);

  if (!place) return null;

  const config = getCategoryConfig(place.category);
  const color = getCategoryColor(place.category);
  const timeRange = formatTimeRange(visit.start_time, visit.end_time);

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 ${
            visit.is_visited
              ? "border-brand-teal bg-brand-teal"
              : "border-surface-bg bg-dark-bg"
          }`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-surface-bg" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="card-style p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-sm font-semibold ${
                  visit.is_visited ? "line-through text-text-secondary" : ""
                }`}
              >
                {place.name}
              </h3>
              <span
                className="inline-block mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: color + "20", color }}
              >
                {config.label}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onToggleVisited
                    ? onToggleVisited(visit.id, !visit.is_visited)
                    : updatePlaceVisit(visit.id, { is_visited: !visit.is_visited })
                }
                className="p-1"
              >
                {visit.is_visited ? (
                  <CheckCircle size={18} className="text-brand-teal" />
                ) : (
                  <Circle size={18} className="text-text-tertiary" />
                )}
              </button>
              <button onClick={onMoveUp} disabled={isFirst} className="p-1 disabled:opacity-20">
                <ChevronUp size={16} className="text-text-secondary" />
              </button>
              <button onClick={onMoveDown} disabled={isLast} className="p-1 disabled:opacity-20">
                <ChevronDown size={16} className="text-text-secondary" />
              </button>
              <button
                onClick={() =>
                  onDelete ? onDelete(visit.id) : deletePlaceVisit(visit.id)
                }
                className="p-1"
              >
                <Trash2 size={14} className="text-red-400/60" />
              </button>
            </div>
          </div>

          {timeRange && (
            <span className="mt-1.5 inline-block rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] text-brand-teal">
              {timeRange}
            </span>
          )}

          {visit.selected_dishes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {visit.selected_dishes.map((dish) => (
                <span
                  key={dish}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: color + "15", color }}
                >
                  {dish}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
