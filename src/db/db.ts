import Dexie, { type Table } from "dexie";
import type { TripPlan, DayPlan, PlaceVisit, CustomCity, CustomPlace } from "@/types/trip";

class VietnamTravelDB extends Dexie {
  trips!: Table<TripPlan, number>;
  dayPlans!: Table<DayPlan, number>;
  placeVisits!: Table<PlaceVisit, number>;
  customCities!: Table<CustomCity, number>;
  customPlaces!: Table<CustomPlace, number>;

  constructor() {
    super("VietnamTravelDB");
    this.version(1).stores({
      trips: "++id, createdAt",
      dayPlans: "++id, tripId, dayNumber",
      placeVisits: "++id, dayPlanId, placeId, orderIndex",
      customCities: "++id, createdAt",
      customPlaces: "++id, customCityId, cityId",
    });
    this.version(2).stores({
      trips: "++id, createdAt",
      dayPlans: "++id, tripId, dayNumber",
      placeVisits: "++id, dayPlanId, placeId, orderIndex",
      customCities: "++id, createdAt",
      customPlaces: "++id, customCityId, cityId",
    });
  }
}

export const db = new VietnamTravelDB();
