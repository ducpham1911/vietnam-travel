"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useTrips, useDayPlans, addPlaceVisit } from "@/db/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { TripPlan, DayPlan } from "@/types/trip";
import { formatDateRange, formatDate } from "@/lib/utils";

interface AddPlaceToTripSheetProps {
  open: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
}

export function AddPlaceToTripSheet({ open, onClose, placeId, placeName }: AddPlaceToTripSheetProps) {
  const trips = useTrips();
  const [step, setStep] = useState<"trip" | "day">("trip");
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const dayPlans = useDayPlans(selectedTrip?.id);

  const handleSelectTrip = (trip: TripPlan) => {
    setSelectedTrip(trip);
    setStep("day");
  };

  const handleSelectDay = async (dayPlan: DayPlan) => {
    const existingVisits = await db.placeVisits
      .where("dayPlanId")
      .equals(dayPlan.id!)
      .count();
    await addPlaceVisit({
      dayPlanId: dayPlan.id!,
      placeId,
      timeSlot: "",
      notes: "",
      isVisited: false,
      orderIndex: existingVisits,
      startTime: null,
      endTime: null,
      selectedDishes: [],
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("trip");
    setSelectedTrip(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={resetAndClose} title={step === "trip" ? "Select Trip" : "Select Day"}>
      {step === "trip" ? (
        <div className="flex flex-col gap-2">
          {trips.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              No trips yet. Create a trip first from the My Trips tab.
            </p>
          ) : (
            trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => handleSelectTrip(trip)}
                className="rounded-xl bg-surface-bg p-3 text-left"
              >
                <p className="text-sm font-semibold">{trip.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </button>
            ))
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setStep("trip")}
            className="flex items-center gap-1 text-xs text-text-secondary mb-3"
          >
            <ArrowLeft size={12} /> Back to trips
          </button>
          <p className="text-xs text-text-secondary mb-3">
            Adding <span className="text-white font-medium">{placeName}</span> to{" "}
            <span className="text-white font-medium">{selectedTrip?.name}</span>
          </p>
          <div className="flex flex-col gap-2">
            {dayPlans.map((dp) => (
              <button
                key={dp.id}
                onClick={() => handleSelectDay(dp)}
                className="flex items-center gap-3 rounded-xl bg-surface-bg p-3 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-teal/20 text-sm font-bold text-brand-teal">
                  {dp.dayNumber}
                </div>
                <div>
                  <p className="text-sm font-medium">Day {dp.dayNumber}</p>
                  <p className="text-xs text-text-secondary">{formatDate(dp.date, "long").split(",")[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
