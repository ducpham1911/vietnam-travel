"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, LogIn, LogOut, Share2 } from "lucide-react";
import { useTrips, useTripMembers } from "@/db/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { TripCard } from "@/components/trips/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateTripSheet } from "@/components/sheets/CreateTripSheet";
import { useMigrateLocalData } from "@/db/migration";

function SharedTripBadge() {
  return (
    <span className="shrink-0 rounded-full bg-brand-teal/20 px-2 py-0.5 text-[10px] font-medium text-brand-teal flex items-center gap-1">
      <Users size={10} />
      Shared
    </span>
  );
}

function TripCardWithBadge({ trip }: { trip: Parameters<typeof TripCard>[0]["trip"] }) {
  const members = useTripMembers(trip.id);
  const isShared = members.length > 1;
  return <TripCard trip={trip} badge={isShared ? <SharedTripBadge /> : undefined} />;
}

export default function TripsPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const trips = useTrips();
  const [showCreate, setShowCreate] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLoggedIn = !!user && !authLoading;

  // Run one-time data migration from Dexie
  useMigrateLocalData();

  // Redirect to login if not logged in
  if (!authLoading && !user) {
    return (
      <div className="px-4 pt-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-sm text-text-secondary">Plan your Vietnam adventure</p>
        </div>
        <EmptyState
          icon={LogIn}
          title="Sign in to get started"
          description="Sign in to create trips and plan your Vietnam adventure"
          action={
            <Link
              href="/login"
              className="rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold inline-block"
            >
              Sign In
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
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
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">My Trips</h1>
            <p className="text-sm text-text-secondary">Plan your Vietnam adventure</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trips.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Trips List */}
      {trips.length > 0 ? (
        <div className="flex flex-col gap-3 pb-4">
          {trips.map((trip) => (
            <TripCardWithBadge key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
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
    </div>
  );
}
