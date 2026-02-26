"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, LogIn, LogOut } from "lucide-react";
import { useTrips } from "@/db/hooks";
import { useSharedTrips } from "@/db/shared-hooks";
import { useAuth } from "@/contexts/AuthContext";
import { TripCard } from "@/components/trips/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateTripSheet } from "@/components/sheets/CreateTripSheet";
import { CreateSharedTripSheet } from "@/components/sheets/CreateSharedTripSheet";
import type { TripPlan } from "@/types/trip";

function SharedTripBadge() {
  return (
    <span className="shrink-0 rounded-full bg-brand-teal/20 px-2 py-0.5 text-[10px] font-medium text-brand-teal flex items-center gap-1">
      <Users size={10} />
      Shared
    </span>
  );
}

export default function TripsPage() {
  const trips = useTrips();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const sharedTrips = useSharedTrips();
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateShared, setShowCreateShared] = useState(false);

  const isLoggedIn = !!user && !authLoading;
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar / Login button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/20 text-sm font-bold text-brand-teal"
              >
                {(profile?.display_name ?? "?")[0].toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="absolute left-0 top-12 z-50 w-48 rounded-xl bg-card-bg border border-surface-bg shadow-lg p-2">
                  <div className="px-3 py-2 border-b border-surface-bg mb-1">
                    <p className="text-sm font-medium truncate">{profile?.display_name}</p>
                    <p className="text-[10px] text-text-tertiary">@{profile?.username}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-surface-bg"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : !authLoading ? (
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-bg"
            >
              <LogIn size={16} className="text-text-tertiary" />
            </Link>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">My Trips</h1>
            <p className="text-sm text-text-secondary">Plan your Vietnam adventure</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(trips.length > 0 || sharedTrips.length > 0) && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Shared Trips Section */}
      {isLoggedIn && sharedTrips.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-brand-teal" />
              <h2 className="text-lg font-semibold">Shared Trips</h2>
            </div>
            <button
              onClick={() => setShowCreateShared(true)}
              className="text-xs font-medium text-brand-teal"
            >
              + New
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {sharedTrips.map((st) => {
              const tripForCard: TripPlan = {
                id: 0,
                name: st.name,
                startDate: st.start_date,
                endDate: st.end_date,
                notes: st.notes,
                cityIds: st.city_ids,
                createdAt: st.created_at,
              };
              return (
                <TripCard
                  key={st.id}
                  trip={tripForCard}
                  href={`/trips/shared/${st.id}`}
                  badge={<SharedTripBadge />}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Create shared trip button when logged in but no shared trips */}
      {isLoggedIn && sharedTrips.length === 0 && (
        <button
          onClick={() => setShowCreateShared(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-teal/30 py-3 text-sm font-medium text-brand-teal"
        >
          <Users size={16} />
          Create Shared Trip
        </button>
      )}

      {/* Local Trips Section */}
      {trips.length > 0 && (
        <>
          {isLoggedIn && (
            <h2 className="text-lg font-semibold mb-3">Local Trips</h2>
          )}
          <div className="flex flex-col gap-3 pb-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}

      {trips.length === 0 && sharedTrips.length === 0 && (
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
      )}

      <CreateTripSheet open={showCreate} onClose={() => setShowCreate(false)} />
      {isLoggedIn && (
        <CreateSharedTripSheet
          open={showCreateShared}
          onClose={() => setShowCreateShared(false)}
        />
      )}
    </div>
  );
}
