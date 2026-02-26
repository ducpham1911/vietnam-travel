import { City, Place, PlaceCategory } from "@/types/city";
import type { CustomCity, CustomPlace } from "@/types/trip";
import { getCityById } from "@/data/cities";
import { getPlaceById } from "@/data/places";
import { cityCoordinates, placeCoordinates } from "@/data/coordinates";
import { db } from "@/db/db";
import {
  isCustomCityRef,
  parseCustomCityRef,
  toCustomCityRef,
  isCustomPlaceRef,
  parseCustomPlaceRef,
  toCustomPlaceRef,
} from "./customRefs";

export interface ResolvedCity {
  id: string; // static id or "cc:N"
  name: string;
  region: string;
  description: string;
  gradientIndex: number;
  imageAsset: string | null;
  isCustom: boolean;
  customId?: number;
  lat?: number;
  lng?: number;
}

export interface ResolvedPlace {
  id: string; // static id or "cp:N"
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  cityRef: string;
  rating: number | null;
  priceLevel: number | null;
  recommendedDishes: string[];
  isCustom: boolean;
  customId?: number;
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
    isCustom: false,
    lat: coords?.lat,
    lng: coords?.lng,
  };
}

export function resolveCustomCityObj(cc: CustomCity): ResolvedCity {
  return {
    id: toCustomCityRef(cc.id!),
    name: cc.name,
    region: cc.region,
    description: cc.cityDescription,
    gradientIndex: cc.id! % 10,
    imageAsset: null,
    isCustom: true,
    customId: cc.id,
    lat: cc.lat,
    lng: cc.lng,
  };
}

export async function resolveCityRef(ref: string): Promise<ResolvedCity | undefined> {
  if (isCustomCityRef(ref)) {
    const numId = parseCustomCityRef(ref);
    const cc = await db.customCities.get(numId);
    return cc ? resolveCustomCityObj(cc) : undefined;
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
    isCustom: false,
    lat: coords?.lat,
    lng: coords?.lng,
  };
}

export function resolveCustomPlaceObj(cp: CustomPlace): ResolvedPlace {
  const cityRef = cp.isCustomCity && cp.customCityId
    ? toCustomCityRef(cp.customCityId)
    : cp.cityId;
  return {
    id: toCustomPlaceRef(cp.id!),
    name: cp.name,
    category: (cp.categoryRawValue || "landmark") as PlaceCategory,
    description: cp.placeDescription,
    address: cp.address,
    cityRef,
    rating: null,
    priceLevel: null,
    recommendedDishes: cp.recommendedDishes,
    isCustom: true,
    customId: cp.id,
    lat: cp.lat,
    lng: cp.lng,
  };
}

export async function resolvePlaceRef(ref: string): Promise<ResolvedPlace | undefined> {
  if (isCustomPlaceRef(ref)) {
    const numId = parseCustomPlaceRef(ref);
    const cp = await db.customPlaces.get(numId);
    return cp ? resolveCustomPlaceObj(cp) : undefined;
  }
  const place = getPlaceById(ref);
  return place ? resolveStaticPlace(place) : undefined;
}
