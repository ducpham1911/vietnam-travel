"use client";

import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useTrips } from "@/db/hooks";
import { TripCard } from "@/components/trips/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateTripSheet } from "@/components/sheets/CreateTripSheet";

export default function TripsPage() {
  const trips = useTrips();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="px-4 pt-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-sm text-text-secondary">Plan your Vietnam adventure</p>
        </div>
        {trips.length > 0 && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No trips yet"
          description="Create your first trip to start planning your Vietnam adventure"
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold"
            >
              Create Trip
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 pb-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      <CreateTripSheet open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
