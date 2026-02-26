import { City, Place, PlaceCategory } from "@/types/city";
import type { CustomCity, CustomPlace } from "@/types/trip";
import { getCityById } from "@/data/cities";
import { getPlaceById } from "@/data/places";
import { cityCoordinates, placeCoordinates } from "@/data/coordinates";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  isCustomCityRef,
  parseCustomCityRef,
  toCustomCityRef,
  isCustomPlaceRef,
  parseCustomPlaceRef,
  toCustomPlaceRef,
} from "./customRefs";

export interface ResolvedCity {
  id: string; // static id or "cc:UUID"
  name: string;
  region: string;
  description: string;
  gradientIndex: number;
  imageAsset: string | null;
  thumbnail: string | null;
  isCustom: boolean;
  customId?: string;
  lat?: number;
  lng?: number;
}

export interface ResolvedPlace {
  id: string; // static id or "cp:UUID"
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  cityRef: string;
  rating: number | null;
  priceLevel: number | null;
  recommendedDishes: string[];
  thumbnail: string | null;
  isCustom: boolean;
  customId?: string;
  lat?: number;
  lng?: number;
}

export function resolveStaticCity(city: City): ResolvedCity {
  const coords = cityCoordinates[city.id];
  return {
    id: city.id,
    name: city.name,
    region: city.region,
    description: city.description,
    gradientIndex: city.gradientIndex,
    imageAsset: city.imageAsset,
    thumbnail: null,
    isCustom: false,
    lat: coords?.lat,
    lng: coords?.lng,
  };
}

export function resolveCustomCityObj(cc: CustomCity): ResolvedCity {
  // Generate a stable gradient index from the UUID
  const hashCode = cc.id.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  return {
    id: toCustomCityRef(cc.id),
    name: cc.name,
    region: cc.region,
    description: cc.city_description,
    gradientIndex: Math.abs(hashCode) % 10,
    imageAsset: null,
    thumbnail: cc.thumbnail ?? null,
    isCustom: true,
    customId: cc.id,
    lat: cc.lat,
    lng: cc.lng,
  };
}

export async function resolveCityRef(ref: string): Promise<ResolvedCity | undefined> {
  if (isCustomCityRef(ref)) {
    const uuid = parseCustomCityRef(ref);
    const supabase = getSupabaseBrowserClient();
    const { data: cc } = await supabase
      .from("custom_cities")
      .select("*")
      .eq("id", uuid)
      .single();
    return cc ? resolveCustomCityObj(cc as CustomCity) : undefined;
  }
  const city = getCityById(ref);
  return city ? resolveStaticCity(city) : undefined;
}

export function resolveStaticPlace(place: Place): ResolvedPlace {
  const coords = placeCoordinates[place.id];
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    description: place.description,
    address: place.address,
    cityRef: place.cityId,
    rating: place.rating,
    priceLevel: place.priceLevel,
    recommendedDishes: place.recommendedDishes,
    thumbnail: null,
    isCustom: false,
    lat: coords?.lat,
    lng: coords?.lng,
  };
}

export function resolveCustomPlaceObj(cp: CustomPlace): ResolvedPlace {
  const cityRef = cp.is_custom_city && cp.custom_city_id
    ? toCustomCityRef(cp.custom_city_id)
    : cp.city_id;
  return {
    id: toCustomPlaceRef(cp.id),
    name: cp.name,
    category: (cp.category_raw_value || "landmark") as PlaceCategory,
    description: cp.place_description,
    address: cp.address,
    cityRef,
    rating: null,
    priceLevel: null,
    recommendedDishes: cp.recommended_dishes,
    thumbnail: cp.thumbnail ?? null,
    isCustom: true,
    customId: cp.id,
    lat: cp.lat,
    lng: cp.lng,
  };
}

export async function resolvePlaceRef(ref: string): Promise<ResolvedPlace | undefined> {
  if (isCustomPlaceRef(ref)) {
    const uuid = parseCustomPlaceRef(ref);
    const supabase = getSupabaseBrowserClient();
    const { data: cp } = await supabase
      .from("custom_places")
      .select("*")
      .eq("id", uuid)
      .single();
    return cp ? resolveCustomPlaceObj(cp as CustomPlace) : undefined;
  }
  const place = getPlaceById(ref);
  return place ? resolveStaticPlace(place) : undefined;
}
