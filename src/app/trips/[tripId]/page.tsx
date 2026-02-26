"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Trash2, MapPin, Share2, Users } from "lucide-react";
import { useTrip, useDayPlans, usePlaceVisits, useTripMembers, deleteTrip, useResolvedCities } from "@/db/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { getCityGradient } from "@/lib/theme";
import { formatDateRange, daysBetween } from "@/lib/utils";
import { DayCard } from "@/components/trips/DayCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ShareTripSheet } from "@/components/sheets/ShareTripSheet";

function DayVisitCounts({ dayPlanId }: { dayPlanId: string }) {
  const visits = usePlaceVisits(dayPlanId);
  return { total: visits.length, visited: visits.filter((v) => v.is_visited).length };
}

function DayCardWithCounts({
  dayPlanId,
  dayPlan,
  tripId,
}: {
  dayPlanId: string;
  dayPlan: { day_number: number; date: string };
  tripId: string;
}) {
  const counts = DayVisitCounts({ dayPlanId });
  return (
    <DayCard
      dayPlan={{ id: dayPlanId, trip_id: tripId, day_number: dayPlan.day_number, date: dayPlan.date, notes: "" }}
      tripId={tripId}
      placeCount={counts.total}
      visitedCount={counts.visited}
    />
  );
}

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const trip = useTrip(tripId);
  const dayPlans = useDayPlans(tripId);
  const members = useTripMembers(tripId);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const cities = useResolvedCities(trip?.city_ids ?? []);

  if (!trip) return <div className="p-4 text-text-secondary">Loading...</div>;

  const isOwner = trip.owner_id === user?.id;
  const numDays = daysBetween(trip.start_date, trip.end_date);

  const handleDelete = async () => {
    await deleteTrip(tripId);
    router.replace("/trips");
  };

  return (
    <div>
      <PageHeader
        title=""
        showBack
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal/20"
            >
              <Share2 size={16} className="text-brand-teal" />
            </button>
            {isOwner && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/20"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            )}
          </div>
        }
      />

      {/* Trip Header Card */}
      <div className="mx-4 mb-4 card-style p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-bold">{trip.name}</h1>
          {members.length > 1 && (
            <span className="shrink-0 rounded-full bg-brand-teal/20 px-2 py-0.5 text-[10px] font-medium text-brand-teal flex items-center gap-1">
              <Users size={10} />
              Shared
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {formatDateRange(trip.start_date, trip.end_date)}
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

        {/* Members preview */}
        {members.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal/20 text-[10px] font-bold text-brand-teal border-2 border-card-bg"
                  title={m.profile?.display_name}
                >
                  {(m.profile?.display_name ?? "?")[0].toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-text-tertiary">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
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
            <DayCardWithCounts
              key={dp.id}
              dayPlanId={dp.id}
              dayPlan={dp}
              tripId={tripId}
            />
          ))}
        </div>
      </div>

      <ShareTripSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        tripId={tripId}
      />

      {isOwner && (
        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete Trip"
          message={`Are you sure you want to delete "${trip.name}"? This will remove all days and planned places.`}
          confirmLabel="Delete"
          destructive
        />
      )}
    </div>
  );
}
