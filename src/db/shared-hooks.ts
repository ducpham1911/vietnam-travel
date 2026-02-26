"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  SharedTrip,
  SharedDayPlan,
  SharedPlaceVisit,
  TripMember,
} from "@/types/shared";
import { daysBetween, addDays } from "@/lib/utils";

// =============================================
// Generic realtime hook helper
// =============================================

function useRealtimeQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[],
  realtimeConfig?: {
    table: string;
    filter?: string;
  }
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  const refetch = useCallback(async () => {
    const result = await queryFn();
    setData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Initial fetch + refetch on dep changes
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Realtime subscription
  useEffect(() => {
    if (!realtimeConfig) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`realtime-${realtimeConfig.table}-${realtimeConfig.filter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: realtimeConfig.table,
          ...(realtimeConfig.filter ? { filter: realtimeConfig.filter } : {}),
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeConfig?.table, realtimeConfig?.filter, refetch]);

  return data;
}

// =============================================
// Read Hooks
// =============================================

export function useSharedTrips(): SharedTrip[] {
  const { user } = useAuth();

  const data = useRealtimeQuery<SharedTrip[]>(
    async () => {
      if (!user) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("shared_trips")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    [user?.id],
    user ? { table: "shared_trips" } : undefined
  );

  return data ?? [];
}

export function useSharedTrip(tripId: string | undefined): SharedTrip | undefined {
  const data = useRealtimeQuery<SharedTrip | null>(
    async () => {
      if (!tripId) return null;
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("shared_trips")
        .select("*")
        .eq("id", tripId)
        .single();
      return data;
    },
    [tripId],
    tripId ? { table: "shared_trips", filter: `id=eq.${tripId}` } : undefined
  );

  return data ?? undefined;
}

export function useSharedDayPlans(tripId: string | undefined): SharedDayPlan[] {
  const data = useRealtimeQuery<SharedDayPlan[]>(
    async () => {
      if (!tripId) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("shared_day_plans")
        .select("*")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });
      return data ?? [];
    },
    [tripId],
    tripId ? { table: "shared_day_plans", filter: `trip_id=eq.${tripId}` } : undefined
  );

  return data ?? [];
}

export function useSharedDayPlan(
  tripId: string | undefined,
  dayNumber: number | undefined
): SharedDayPlan | undefined {
  const data = useRealtimeQuery<SharedDayPlan | null>(
    async () => {
      if (!tripId || dayNumber === undefined) return null;
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("shared_day_plans")
        .select("*")
        .eq("trip_id", tripId)
        .eq("day_number", dayNumber)
        .single();
      return data;
    },
    [tripId, dayNumber]
  );

  return data ?? undefined;
}

export function useSharedPlaceVisits(dayPlanId: string | undefined): SharedPlaceVisit[] {
  const data = useRealtimeQuery<SharedPlaceVisit[]>(
    async () => {
      if (!dayPlanId) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("shared_place_visits")
        .select("*")
        .eq("day_plan_id", dayPlanId)
        .order("order_index", { ascending: true });
      return data ?? [];
    },
    [dayPlanId],
    dayPlanId
      ? { table: "shared_place_visits", filter: `day_plan_id=eq.${dayPlanId}` }
      : undefined
  );

  return data ?? [];
}

export function useTripMembers(tripId: string | undefined): TripMember[] {
  const data = useRealtimeQuery<TripMember[]>(
    async () => {
      if (!tripId) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("trip_members")
        .select("*, profile:profiles(username, display_name)")
        .eq("trip_id", tripId)
        .order("joined_at", { ascending: true });
      return (data ?? []).map((m: Record<string, unknown>) => ({
        ...m,
        profile: m.profile as TripMember["profile"],
      })) as TripMember[];
    },
    [tripId]
  );

  return data ?? [];
}

// =============================================
// Mutations
// =============================================

export async function createSharedTrip(trip: {
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
  city_ids: string[];
  owner_id: string;
}): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();

  // Insert the trip
  const { data: tripData, error: tripError } = await supabase
    .from("shared_trips")
    .insert({
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      notes: trip.notes,
      city_ids: trip.city_ids,
      owner_id: trip.owner_id,
    })
    .select("id")
    .single();

  if (tripError || !tripData) {
    console.error("Failed to create shared trip:", tripError?.message);
    return null;
  }

  const tripId = tripData.id;

  // Add owner as member
  await supabase.from("trip_members").insert({
    trip_id: tripId,
    user_id: trip.owner_id,
    role: "owner",
  });

  // Auto-generate day plans
  const numDays = daysBetween(trip.start_date, trip.end_date);
  const dayPlans = [];
  for (let i = 0; i < numDays; i++) {
    dayPlans.push({
      trip_id: tripId,
      day_number: i + 1,
      date: addDays(trip.start_date, i),
      notes: "",
    });
  }
  await supabase.from("shared_day_plans").insert(dayPlans);

  return tripId;
}

export async function deleteSharedTrip(tripId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("shared_trips").delete().eq("id", tripId);
}

export async function addSharedPlaceVisit(visit: {
  day_plan_id: string;
  place_id: string;
  order_index: number;
  start_time?: string | null;
  end_time?: string | null;
  selected_dishes?: string[];
  added_by?: string | null;
}): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("shared_place_visits")
    .insert({
      day_plan_id: visit.day_plan_id,
      place_id: visit.place_id,
      order_index: visit.order_index,
      is_visited: false,
      start_time: visit.start_time ?? null,
      end_time: visit.end_time ?? null,
      notes: "",
      selected_dishes: visit.selected_dishes ?? [],
      added_by: visit.added_by ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to add shared place visit:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function updateSharedPlaceVisit(
  id: string,
  changes: Partial<SharedPlaceVisit>
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("shared_place_visits").update(changes).eq("id", id);
}

export async function deleteSharedPlaceVisit(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("shared_place_visits").delete().eq("id", id);
}

export async function reorderSharedVisits(
  visits: { id: string; order_index: number }[]
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  // Batch update order_index for each visit
  for (const visit of visits) {
    await supabase
      .from("shared_place_visits")
      .update({ order_index: visit.order_index })
      .eq("id", visit.id);
  }
}

export async function generateInviteCode(tripId: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("generate_invite_code", {
    p_trip_id: tripId,
  });
  if (error) {
    console.error("Failed to generate invite code:", error.message);
    return null;
  }
  return data;
}

export interface TripPreview {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  city_ids: string[];
  notes: string;
  owner: { display_name: string; username: string };
  member_count: number;
}

export async function previewTripByInvite(inviteCode: string): Promise<TripPreview | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("preview_trip_by_invite", {
    p_invite_code: inviteCode,
  });
  if (error || !data) {
    console.error("Failed to preview trip:", error?.message);
    return null;
  }
  return data as TripPreview;
}

export async function joinTrip(inviteCode: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("join_trip", {
    p_invite_code: inviteCode,
  });
  if (error) {
    console.error("Failed to join trip:", error.message);
    return null;
  }
  return data;
}
