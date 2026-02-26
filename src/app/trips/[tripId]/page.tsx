"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Trash2, MapPin } from "lucide-react";
import { useTrip, useDayPlans, deleteTrip, useResolvedCities } from "@/db/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { getCityGradient } from "@/lib/theme";
import { formatDateRange, daysBetween } from "@/lib/utils";
import { DayCard } from "@/components/trips/DayCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const id = Number(tripId);
  const trip = useTrip(id);
  const dayPlans = useDayPlans(id);
  const [showDelete, setShowDelete] = useState(false);

  const cities = useResolvedCities(trip?.cityIds ?? []);

  // Get place visit counts for each day plan
  const visitCounts = useLiveQuery(async () => {
    const counts: Record<number, { total: number; visited: number }> = {};
    for (const dp of dayPlans) {
      if (!dp.id) continue;
      const visits = await db.placeVisits.where("dayPlanId").equals(dp.id).toArray();
      counts[dp.id] = {
        total: visits.length,
        visited: visits.filter((v) => v.isVisited).length,
      };
    }
    return counts;
  }, [dayPlans]);

  if (!trip) return <div className="p-4 text-text-secondary">Loading...</div>;

  const numDays = daysBetween(trip.startDate, trip.endDate);

  const handleDelete = async () => {
    await deleteTrip(id);
    router.replace("/trips");
  };

  return (
    <div>
      <PageHeader
        title=""
        showBack
        action={
          <button
            onClick={() => setShowDelete(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/20"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        }
      />

      {/* Trip Header Card */}
      <div className="mx-4 mb-4 card-style p-4">
        <h1 className="text-xl font-bold mb-2">{trip.name}</h1>
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="rounded-full bg-brand-teal/20 px-2 py-0.5 text-xs font-medium text-brand-teal">
            {numDays} {numDays === 1 ? "day" : "days"}
          </span>
        </div>
        {trip.notes && (
          <p className="text-xs text-text-tertiary bg-surface-bg rounded-lg px-3 py-2 mb-2">
            {trip.notes}
          </p>
        )}
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              const [grad] = getCityGradient(city.gradientIndex);
              return (
                <span
                  key={city.id}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: grad + "20", color: grad }}
                >
                  <MapPin size={9} />
                  {city.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Itinerary */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Itinerary</h2>
        </div>
        <div className="flex flex-col gap-2 pb-4">
          {dayPlans.map((dp) => (
            <DayCard
              key={dp.id}
              dayPlan={dp}
              tripId={id}
              placeCount={visitCounts?.[dp.id!]?.total ?? 0}
              visitedCount={visitCounts?.[dp.id!]?.visited ?? 0}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip.name}"? This will remove all days and planned places.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
