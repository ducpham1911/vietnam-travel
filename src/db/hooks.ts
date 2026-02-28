"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Trip,
  DayPlan,
  PlaceVisit,
  CustomCity,
  CustomPlace,
  TripMember,
} from "@/types/trip";
import { daysBetween, addDays } from "@/lib/utils";
import { getPlacesByCity } from "@/data/places";
import { isCustomCityRef, parseCustomCityRef } from "@/lib/customRefs";
import {
  resolveCityRef,
  resolveStaticPlace,
  resolveCustomPlaceObj,
  resolvePlaceRef,
  type ResolvedCity,
  type ResolvedPlace,
} from "@/lib/resolvers";

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

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!realtimeConfig) return;

    const supabase = getSupabaseBrowserClient();
    const channelName = `realtime-${realtimeConfig.table}-${realtimeConfig.filter ?? "all"}`;
    const channel = supabase
      .channel(channelName)
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
      .subscribe((status: string, err: Error | undefined) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Channel error on ${channelName}:`, err);
        }
        if (status === "TIMED_OUT") {
          console.warn(`[Realtime] Subscription timed out on ${channelName}, retrying...`);
          channel.subscribe();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeConfig?.table, realtimeConfig?.filter, refetch]);

  return data;
}

// =============================================
// Read Hooks — Trips
// =============================================

export function useTrips(): Trip[] {
  const { user } = useAuth();

  const data = useRealtimeQuery<Trip[]>(
    async () => {
      if (!user) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    [user?.id],
    user ? { table: "trips" } : undefined
  );

  return data ?? [];
}

export function useTrip(id: string | undefined): Trip | undefined {
  const data = useRealtimeQuery<Trip | null>(
    async () => {
      if (!id) return null;
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
    [id],
    id ? { table: "trips", filter: `id=eq.${id}` } : undefined
  );

  return data ?? undefined;
}

// =============================================
// Read Hooks — Day Plans
// =============================================

export function useDayPlans(tripId: string | undefined): DayPlan[] {
  const data = useRealtimeQuery<DayPlan[]>(
    async () => {
      if (!tripId) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("day_plans")
        .select("*")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });
      return data ?? [];
    },
    [tripId],
    tripId ? { table: "day_plans", filter: `trip_id=eq.${tripId}` } : undefined
  );

  return data ?? [];
}

export function useDayPlan(
  tripId: string | undefined,
  dayNumber: number | undefined
): DayPlan | undefined {
  const data = useRealtimeQuery<DayPlan | null>(
    async () => {
      if (!tripId || dayNumber === undefined) return null;
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("day_plans")
        .select("*")
        .eq("trip_id", tripId)
        .eq("day_number", dayNumber)
        .single();
      return data;
    },
    [tripId, dayNumber],
    tripId && dayNumber !== undefined
      ? { table: "day_plans", filter: `trip_id=eq.${tripId}` }
      : undefined
  );

  return data ?? undefined;
}

// =============================================
// Read Hooks — Place Visits
// =============================================

export function usePlaceVisits(dayPlanId: string | undefined): PlaceVisit[] {
  const data = useRealtimeQuery<PlaceVisit[]>(
    async () => {
      if (!dayPlanId) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("place_visits")
        .select("*")
        .eq("day_plan_id", dayPlanId)
        .order("order_index", { ascending: true });
      return data ?? [];
    },
    [dayPlanId],
    dayPlanId
      ? { table: "place_visits", filter: `day_plan_id=eq.${dayPlanId}` }
      : undefined
  );

  return data ?? [];
}

// =============================================
// Read Hooks — Trip Members
// =============================================

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
    [tripId],
    tripId ? { table: "trip_members", filter: `trip_id=eq.${tripId}` } : undefined
  );

  return data ?? [];
}

// =============================================
// Read Hooks — Custom Cities & Places
// =============================================

export function useCustomCities(): CustomCity[] {
  const { user } = useAuth();

  const data = useRealtimeQuery<CustomCity[]>(
    async () => {
      if (!user) return [];
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("custom_cities")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    [user?.id],
    user ? { table: "custom_cities" } : undefined
  );

  return data ?? [];
}

export function useCustomPlaces(cityId?: string, customCityId?: string): CustomPlace[] {
  const { user } = useAuth();

  const data = useRealtimeQuery<CustomPlace[]>(
    async () => {
      if (!user) return [];
      const supabase = getSupabaseBrowserClient();
      let query = supabase.from("custom_places").select("*");
      if (customCityId) {
        query = query.eq("custom_city_id", customCityId);
      } else if (cityId) {
        query = query.eq("city_id", cityId);
      }
      const { data } = await query;
      return data ?? [];
    },
    [user?.id, cityId, customCityId],
    user ? { table: "custom_places" } : undefined
  );

  return data ?? [];
}

// =============================================
// Resolved Helpers
// =============================================

export function useResolvedCities(refs: string[]): ResolvedCity[] {
  const [cities, setCities] = useState<ResolvedCity[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      const results: ResolvedCity[] = [];
      for (const ref of refs) {
        const resolved = await resolveCityRef(ref);
        if (resolved) results.push(resolved);
      }
      if (!cancelled) setCities(results);
    }
    resolve();
    return () => { cancelled = true; };
  }, [refs.join(",")]);

  return cities;
}

export function usePlacesForCityRef(ref: string): ResolvedPlace[] {
  const { user } = useAuth();
  const [places, setPlaces] = useState<ResolvedPlace[]>([]);

  const fetchPlaces = useCallback(async () => {
    if (!ref) { setPlaces([]); return; }

    if (isCustomCityRef(ref)) {
      const uuid = parseCustomCityRef(ref);
      const supabase = getSupabaseBrowserClient();
      const { data: customPlaces } = await supabase
        .from("custom_places")
        .select("*")
        .eq("custom_city_id", uuid);
      setPlaces((customPlaces ?? []).map(resolveCustomPlaceObj));
      return;
    }

    // Static city: return static places + custom places added to this city
    const staticPlaces = getPlacesByCity(ref).map(resolveStaticPlace);
    const supabase = getSupabaseBrowserClient();
    const { data: customPlaces } = await supabase
      .from("custom_places")
      .select("*")
      .eq("city_id", ref)
      .eq("is_custom_city", false);
    const resolvedCustom = (customPlaces ?? []).map(resolveCustomPlaceObj);
    setPlaces([...staticPlaces, ...resolvedCustom]);
  }, [ref]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces, user?.id]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    const filter = isCustomCityRef(ref)
      ? `custom_city_id=eq.${parseCustomCityRef(ref)}`
      : `city_id=eq.${ref}`;
    const channel = supabase
      .channel(`realtime-custom-places-${ref}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_places", filter },
        () => { fetchPlaces(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ref, user, fetchPlaces]);

  return places;
}

export function useResolvePlaceRef(ref: string): ResolvedPlace | undefined {
  const [place, setPlace] = useState<ResolvedPlace | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    resolvePlaceRef(ref).then((resolved) => {
      if (!cancelled) setPlace(resolved);
    });
    return () => { cancelled = true; };
  }, [ref]);

  return place;
}

// =============================================
// Mutations — Trips
// =============================================

export async function createTrip(trip: {
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
  city_ids: string[];
  owner_id: string;
}): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();

  const { data: tripData, error: tripError } = await supabase
    .from("trips")
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
    console.error("Failed to create trip:", tripError?.message);
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
  await supabase.from("day_plans").insert(dayPlans);

  return tripId;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("trips").delete().eq("id", tripId);
}

// =============================================
// Mutations — Place Visits
// =============================================

export async function addPlaceVisit(visit: {
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
    .from("place_visits")
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
    console.error("Failed to add place visit:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function updatePlaceVisit(
  id: string,
  changes: Partial<PlaceVisit>
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("place_visits").update(changes).eq("id", id);
}

export async function deletePlaceVisit(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("place_visits").delete().eq("id", id);
}

export async function reorderVisits(
  visits: { id: string; order_index: number }[]
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  for (const visit of visits) {
    await supabase
      .from("place_visits")
      .update({ order_index: visit.order_index })
      .eq("id", visit.id);
  }
}

// =============================================
// Mutations — Custom Cities
// =============================================

export async function createCustomCity(city: {
  user_id: string;
  name: string;
  region: string;
  city_description: string;
  lat?: number;
  lng?: number;
  thumbnail?: string;
}): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("custom_cities")
    .insert(city)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create custom city:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function deleteCustomCity(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("custom_cities").delete().eq("id", id);
}

// =============================================
// Mutations — Custom Places
// =============================================

export async function createCustomPlace(place: {
  user_id: string;
  name: string;
  category_raw_value: string;
  place_description: string;
  address: string;
  city_id: string;
  custom_city_id?: string;
  is_custom_city: boolean;
  lat?: number;
  lng?: number;
  thumbnail?: string;
  recommended_dishes: string[];
}): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("custom_places")
    .insert(place)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create custom place:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// =============================================
// RPC — Invite / Join
// =============================================

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
