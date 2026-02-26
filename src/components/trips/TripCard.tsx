"use client";

import Link from "next/link";
import { Calendar, MapPin, Navigation } from "lucide-react";
import { TripPlan } from "@/types/trip";
import { getCityById } from "@/data/cities";
import { getCityGradient } from "@/lib/theme";
import { formatDateRange, daysBetween } from "@/lib/utils";

interface TripCardProps {
  trip: TripPlan;
}

export function TripCard({ trip }: TripCardProps) {
  const numDays = daysBetween(trip.startDate, trip.endDate);
  const cities = trip.cityIds.map(getCityById).filter(Boolean);

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="card-style p-4">
        <h3 className="text-base font-semibold mb-2">{trip.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={13} className="text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="rounded-full bg-brand-teal/20 px-2 py-0.5 text-[10px] font-medium text-brand-teal">
            {numDays} {numDays === 1 ? "day" : "days"}
          </span>
        </div>
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              if (!city) return null;
              const [grad] = getCityGradient(city.gradientIndex);
              return (
                <span
                  key={city.id}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: grad + "20", color: grad }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: grad }}
                  />
                  {city.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
