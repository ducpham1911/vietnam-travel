import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { TripPlan, DayPlan, PlaceVisit, CustomCity, CustomPlace } from "@/types/trip";
import { addDays, daysBetween } from "@/lib/utils";
import { getPlacesByCity } from "@/data/places";
import { isCustomCityRef, parseCustomCityRef } from "@/lib/customRefs";
import {
  resolveCityRef,
  resolveStaticPlace,
  resolveCustomPlaceObj,
  type ResolvedCity,
  type ResolvedPlace,
} from "@/lib/resolvers";

// ===== Trips =====

export function useTrips() {
  return useLiveQuery(() => db.trips.orderBy("createdAt").reverse().toArray(), []) ?? [];
}

export function useTrip(id: number | undefined) {
  return useLiveQuery(() => (id ? db.trips.get(id) : undefined), [id]);
}

export async function createTrip(trip: Omit<TripPlan, "id">) {
  const tripId = await db.trips.add(trip as TripPlan);
  const numDays = daysBetween(trip.startDate, trip.endDate);
  const dayPlans: Omit<DayPlan, "id">[] = [];
  for (let i = 0; i < numDays; i++) {
    dayPlans.push({
      tripId: tripId as number,
      dayNumber: i + 1,
      date: addDays(trip.startDate, i),
      notes: "",
    });
  }
  await db.dayPlans.bulkAdd(dayPlans as DayPlan[]);
  return tripId;
}

export async function deleteTrip(tripId: number) {
  await db.transaction("rw", [db.trips, db.dayPlans, db.placeVisits], async () => {
    const dayPlanIds = (await db.dayPlans.where("tripId").equals(tripId).toArray()).map(
      (d) => d.id!
    );
    if (dayPlanIds.length > 0) {
      await db.placeVisits
        .where("dayPlanId")
        .anyOf(dayPlanIds)
        .delete();
      await db.dayPlans.where("tripId").equals(tripId).delete();
    }
    await db.trips.delete(tripId);
  });
}

// ===== Day Plans =====

export function useDayPlans(tripId: number | undefined) {
  return (
    useLiveQuery(
      () =>
        tripId
          ? db.dayPlans.where("tripId").equals(tripId).sortBy("dayNumber")
          : [],
      [tripId]
    ) ?? []
  );
}

export function useDayPlan(tripId: number | undefined, dayNumber: number | undefined) {
  return useLiveQuery(
    () =>
      tripId && dayNumber
        ? db.dayPlans
            .where({ tripId, dayNumber })
            .first()
        : undefined,
    [tripId, dayNumber]
  );
}

// ===== Place Visits =====

export function usePlaceVisits(dayPlanId: number | undefined) {
  return (
    useLiveQuery(
      () =>
        dayPlanId
          ? db.placeVisits.where("dayPlanId").equals(dayPlanId).sortBy("orderIndex")
          : [],
      [dayPlanId]
    ) ?? []
  );
}

export async function addPlaceVisit(visit: Omit<PlaceVisit, "id">) {
  return db.placeVisits.add(visit as PlaceVisit);
}

export async function updatePlaceVisit(id: number, changes: Partial<PlaceVisit>) {
  return db.placeVisits.update(id, changes);
}

export async function deletePlaceVisit(id: number) {
  return db.placeVisits.delete(id);
}

export async function reorderVisits(dayPlanId: number, visits: PlaceVisit[]) {
  await db.transaction("rw", db.placeVisits, async () => {
    for (let i = 0; i < visits.length; i++) {
      await db.placeVisits.update(visits[i].id!, { orderIndex: i });
    }
  });
}

// ===== Custom Cities =====

export function useCustomCities() {
  return useLiveQuery(() => db.customCities.orderBy("createdAt").reverse().toArray(), []) ?? [];
}

export async function createCustomCity(city: Omit<CustomCity, "id">) {
  return db.customCities.add(city as CustomCity);
}

export async function deleteCustomCity(id: number) {
  await db.transaction("rw", [db.customCities, db.customPlaces], async () => {
    await db.customPlaces.where("customCityId").equals(id).delete();
    await db.customCities.delete(id);
  });
}

// ===== Custom Places =====

export function useCustomPlaces(cityId?: string, customCityId?: number) {
  return (
    useLiveQuery(() => {
      if (customCityId) return db.customPlaces.where("customCityId").equals(customCityId).toArray();
      if (cityId) return db.customPlaces.where("cityId").equals(cityId).toArray();
      return db.customPlaces.toArray();
    }, [cityId, customCityId]) ?? []
  );
}

export async function createCustomPlace(place: Omit<CustomPlace, "id">) {
  return db.customPlaces.add(place as CustomPlace);
}

// ===== Resolved Helpers =====

export function useResolvedCities(refs: string[]): ResolvedCity[] {
  return (
    useLiveQuery(async () => {
      const results: ResolvedCity[] = [];
      for (const ref of refs) {
        const resolved = await resolveCityRef(ref);
        if (resolved) results.push(resolved);
      }
      return results;
    }, [refs.join(",")]) ?? []
  );
}

export function usePlacesForCityRef(ref: string): ResolvedPlace[] {
  return (
    useLiveQuery(async () => {
      if (isCustomCityRef(ref)) {
        const numId = parseCustomCityRef(ref);
        const customPlaces = await db.customPlaces
          .where("customCityId")
          .equals(numId)
          .toArray();
        return customPlaces.map(resolveCustomPlaceObj);
      }
      // Static city: return static places + any custom places added to this city
      const staticPlaces = getPlacesByCity(ref).map(resolveStaticPlace);
      const customPlaces = await db.customPlaces
        .where("cityId")
        .equals(ref)
        .toArray();
      const resolvedCustom = customPlaces
        .filter((cp) => !cp.isCustomCity)
        .map(resolveCustomPlaceObj);
      return [...staticPlaces, ...resolvedCustom];
    }, [ref]) ?? []
  );
}
