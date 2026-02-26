export interface TripPlan {
  id?: number;
  name: string;
  startDate: string; // ISO date string
  endDate: string;
  notes: string;
  cityIds: string[];
  createdAt: string;
}

export interface DayPlan {
  id?: number;
  tripId: number;
  dayNumber: number;
  date: string;
  notes: string;
}

export interface PlaceVisit {
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

export interface CustomCity {
  id?: number;
  name: string;
  region: string;
  cityDescription: string;
  lat?: number;
  lng?: number;
  thumbnail?: string;
  createdAt: string;
}

export interface CustomPlace {
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
