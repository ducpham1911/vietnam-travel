// Unified types matching Supabase schema (snake_case, string UUIDs)

export interface Trip {
  id: string;
  owner_id: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string;
  notes: string;
  city_ids: string[];
  invite_code: string | null;
  invite_expires_at: string | null;
  created_at: string;
}

export interface DayPlan {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  notes: string;
}

export interface PlaceVisit {
  id: string;
  day_plan_id: string;
  place_id: string;
  order_index: number;
  is_visited: boolean;
  start_time: string | null;
  end_time: string | null;
  notes: string;
  selected_dishes: string[];
  added_by: string | null;
  created_at: string;
}

export interface CustomCity {
  id: string;
  user_id: string;
  name: string;
  region: string;
  city_description: string;
  lat?: number;
  lng?: number;
  thumbnail?: string;
  created_at: string;
}

export interface CustomPlace {
  id: string;
  user_id: string;
  custom_city_id?: string;
  name: string;
  category_raw_value: string;
  place_description: string;
  address: string;
  city_id: string;
  is_custom_city: boolean;
  lat?: number;
  lng?: number;
  thumbnail?: string;
  recommended_dishes: string[];
  created_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: {
    username: string;
    display_name: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
}
