"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MIGRATION_FLAG = "dexie_migration_done";

/**
 * One-time migration hook: reads all data from the old Dexie (IndexedDB)
 * database and inserts it into Supabase, then deletes the Dexie database.
 */
export function useMigrateLocalData() {
  const { user } = useAuth();
  const running = useRef(false);

  useEffect(() => {
    if (!user || running.current) return;
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    running.current = true;
    migrateIfNeeded(user.id).finally(() => {
      running.current = false;
    });
  }, [user]);
}

async function migrateIfNeeded(userId: string) {
  // Check if the old Dexie database exists
  let dbExists = false;
  try {
    if (typeof indexedDB === "undefined") return;
    const databases = await indexedDB.databases();
    dbExists = databases.some((db) => db.name === "VietnamTravelDB");
  } catch {
    // indexedDB.databases() not supported in all browsers — try opening directly
    try {
      const req = indexedDB.open("VietnamTravelDB");
      await new Promise<void>((resolve, reject) => {
        req.onsuccess = () => {
          const db = req.result;
          // If the database has object stores, it exists with data
          dbExists = db.objectStoreNames.length > 0;
          db.close();
          resolve();
        };
        req.onerror = () => reject(req.error);
        // If onupgradeneeded fires with version 1, the DB didn't exist before
        req.onupgradeneeded = () => {
          // DB is being created fresh — no data to migrate
          req.transaction?.abort();
          resolve();
        };
      });
    } catch {
      return;
    }
  }

  if (!dbExists) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return;
  }

  try {
    await performMigration(userId);
    // Delete the Dexie database after successful migration
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase("VietnamTravelDB");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    localStorage.setItem(MIGRATION_FLAG, "1");
    console.log("Dexie → Supabase migration complete");
  } catch (err) {
    console.error("Migration failed:", err);
    // Don't set flag — will retry next time
  }
}

async function performMigration(userId: string) {
  // Open the old DB
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("VietnamTravelDB");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const supabase = getSupabaseBrowserClient();

  // Helper to read all records from an object store
  function readAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  // Read all data from Dexie
  interface OldCustomCity {
    id?: number;
    name: string;
    region: string;
    cityDescription: string;
    lat?: number;
    lng?: number;
    thumbnail?: string;
    createdAt: string;
  }

  interface OldCustomPlace {
    id?: number;
    customCityId?: number;
    name: string;
    categoryRawValue: string;
    placeDescription: string;
    address: string;
    cityId: string;
    isCustomCity: boolean;
    lat?: number;
    lng?: number;
    thumbnail?: string;
    recommendedDishes: string[];
    createdAt: string;
  }

  interface OldTrip {
    id?: number;
    name: string;
    startDate: string;
    endDate: string;
    notes: string;
    cityIds: string[];
    createdAt: string;
  }

  interface OldDayPlan {
    id?: number;
    tripId: number;
    dayNumber: number;
    date: string;
    notes: string;
  }

  interface OldPlaceVisit {
    id?: number;
    dayPlanId: number;
    placeId: string;
    timeSlot: string;
    notes: string;
    isVisited: boolean;
    orderIndex: number;
    startTime: string | null;
    endTime: string | null;
    selectedDishes: string[];
  }

  const oldCustomCities = await readAll<OldCustomCity>("customCities");
  const oldCustomPlaces = await readAll<OldCustomPlace>("customPlaces");
  const oldTrips = await readAll<OldTrip>("trips");
  const oldDayPlans = await readAll<OldDayPlan>("dayPlans");
  const oldPlaceVisits = await readAll<OldPlaceVisit>("placeVisits");

  db.close();

  // Skip if no data
  if (
    oldCustomCities.length === 0 &&
    oldCustomPlaces.length === 0 &&
    oldTrips.length === 0
  ) {
    return;
  }

  // Maps: old integer ID → new UUID
  const cityIdMap = new Map<number, string>();
  const placeIdMap = new Map<number, string>();
  const tripIdMap = new Map<number, string>();
  const dayPlanIdMap = new Map<number, string>();

  // 1. Migrate custom cities
  for (const cc of oldCustomCities) {
    const { data, error } = await supabase
      .from("custom_cities")
      .insert({
        user_id: userId,
        name: cc.name,
        region: cc.region,
        city_description: cc.cityDescription,
        lat: cc.lat,
        lng: cc.lng,
        thumbnail: cc.thumbnail,
      })
      .select("id")
      .single();

    if (data && !error) {
      cityIdMap.set(cc.id!, data.id);
    }
  }

  // 2. Migrate custom places
  for (const cp of oldCustomPlaces) {
    const newCustomCityId = cp.customCityId ? cityIdMap.get(cp.customCityId) : undefined;
    const { data, error } = await supabase
      .from("custom_places")
      .insert({
        user_id: userId,
        custom_city_id: newCustomCityId ?? null,
        name: cp.name,
        category_raw_value: cp.categoryRawValue,
        place_description: cp.placeDescription,
        address: cp.address,
        city_id: cp.cityId,
        is_custom_city: cp.isCustomCity,
        lat: cp.lat,
        lng: cp.lng,
        thumbnail: cp.thumbnail,
        recommended_dishes: cp.recommendedDishes,
      })
      .select("id")
      .single();

    if (data && !error) {
      placeIdMap.set(cp.id!, data.id);
    }
  }

  // Helper: remap a city ref from old integer to new UUID
  function remapCityRef(ref: string): string {
    if (ref.startsWith("cc:")) {
      const oldId = Number(ref.slice(3));
      const newId = cityIdMap.get(oldId);
      return newId ? `cc:${newId}` : ref;
    }
    return ref;
  }

  // Helper: remap a place ref from old integer to new UUID
  function remapPlaceRef(ref: string): string {
    if (ref.startsWith("cp:")) {
      const oldId = Number(ref.slice(3));
      const newId = placeIdMap.get(oldId);
      return newId ? `cp:${newId}` : ref;
    }
    return ref;
  }

  // 3. Migrate trips
  for (const trip of oldTrips) {
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert({
        owner_id: userId,
        name: trip.name,
        start_date: trip.startDate,
        end_date: trip.endDate,
        notes: trip.notes,
        city_ids: trip.cityIds.map(remapCityRef),
      })
      .select("id")
      .single();

    if (!tripData || tripError) continue;
    tripIdMap.set(trip.id!, tripData.id);

    // Add owner as member
    await supabase.from("trip_members").insert({
      trip_id: tripData.id,
      user_id: userId,
      role: "owner",
    });

    // 4. Migrate day plans for this trip
    const tripDayPlans = oldDayPlans.filter((dp) => dp.tripId === trip.id!);
    for (const dp of tripDayPlans) {
      const { data: dpData, error: dpError } = await supabase
        .from("day_plans")
        .insert({
          trip_id: tripData.id,
          day_number: dp.dayNumber,
          date: dp.date,
          notes: dp.notes,
        })
        .select("id")
        .single();

      if (!dpData || dpError) continue;
      dayPlanIdMap.set(dp.id!, dpData.id);
    }
  }

  // 5. Migrate place visits
  for (const pv of oldPlaceVisits) {
    const newDayPlanId = dayPlanIdMap.get(pv.dayPlanId);
    if (!newDayPlanId) continue;

    await supabase.from("place_visits").insert({
      day_plan_id: newDayPlanId,
      place_id: remapPlaceRef(pv.placeId),
      order_index: pv.orderIndex,
      is_visited: pv.isVisited,
      start_time: pv.startTime,
      end_time: pv.endTime,
      notes: pv.notes,
      selected_dishes: pv.selectedDishes,
      added_by: userId,
    });
  }
}
