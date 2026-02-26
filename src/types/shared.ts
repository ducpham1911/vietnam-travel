export interface SharedTrip {
  id: string;
  owner_id: string;
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
  city_ids: string[];
  invite_code: string | null;
  invite_expires_at: string | null;
  created_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  // Joined from profiles
  profile?: {
    username: string;
    display_name: string;
  };
}

export interface SharedDayPlan {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  notes: string;
}

export interface SharedPlaceVisit {
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

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
}
