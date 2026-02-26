"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, CalendarDays, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useSharedTrip,
  useSharedDayPlan,
  useSharedPlaceVisits,
  updateSharedPlaceVisit,
  deleteSharedPlaceVisit,
  reorderSharedVisits,
} from "@/db/shared-hooks";
import { formatDate } from "@/lib/utils";
import { PlaceVisitRow } from "@/components/trips/PlaceVisitRow";
import { AddPlaceToSharedDaySheet } from "@/components/sheets/AddPlaceToSharedDaySheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PlaceVisit } from "@/types/trip";
import type { SharedPlaceVisit } from "@/types/shared";

// Adapter: convert SharedPlaceVisit to PlaceVisit shape for PlaceVisitRow
function toLocalVisit(v: SharedPlaceVisit): PlaceVisit {
  return {
    id: v.id as unknown as number, // PlaceVisitRow uses visit.id! which works with string too
    dayPlanId: v.day_plan_id as unknown as number,
    placeId: v.place_id,
    timeSlot: "",
    notes: v.notes,
    isVisited: v.is_visited,
    orderIndex: v.order_index,
    startTime: v.start_time,
    endTime: v.end_time,
    selectedDishes: v.selected_dishes,
  };
}

function SortableVisitItem({
  visit,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggleVisited,
  onDelete,
}: {
  visit: PlaceVisit;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisited: (id: number | string, isVisited: boolean) => void;
  onDelete: (id: number | string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(visit.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-3 p-1 touch-none text-text-tertiary"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1">
          <PlaceVisitRow
            visit={visit}
            isFirst={index === 0}
            isLast={index === total - 1}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleVisited={onToggleVisited}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default function SharedDayPlanPage() {
  const { tripId, dayNumber } = useParams<{ tripId: string; dayNumber: string }>();
  const numDay = Number(dayNumber);
  const trip = useSharedTrip(tripId);
  const dayPlan = useSharedDayPlan(tripId, numDay);
  const sharedVisits = useSharedPlaceVisits(dayPlan?.id);
  const visits = sharedVisits.map(toLocalVisit);
  const [showAdd, setShowAdd] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  if (!trip || !dayPlan) return <div className="p-4 text-text-secondary">Loading...</div>;

  const handleToggleVisited = (id: number | string, isVisited: boolean) => {
    updateSharedPlaceVisit(String(id), { is_visited: isVisited });
  };

  const handleDelete = (id: number | string) => {
    deleteSharedPlaceVisit(String(id));
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newVisits = [...sharedVisits];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newVisits.length) return;
    [newVisits[index], newVisits[swapIndex]] = [newVisits[swapIndex], newVisits[index]];
    await reorderSharedVisits(
      newVisits.map((v, i) => ({ id: v.id, order_index: i }))
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sharedVisits.findIndex((v) => v.id === String(active.id));
    const newIndex = sharedVisits.findIndex((v) => v.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newVisits = [...sharedVisits];
    const [moved] = newVisits.splice(oldIndex, 1);
    newVisits.splice(newIndex, 0, moved);
    await reorderSharedVisits(
      newVisits.map((v, i) => ({ id: v.id, order_index: i }))
    );
  };

  return (
    <div>
      <PageHeader title="" showBack />

      {/* Day Header */}
      <div className="mx-4 mb-4 card-style p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Day {dayPlan.day_number}</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {formatDate(dayPlan.date, "long")}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/20">
            <span className="text-sm font-bold text-brand-teal">{visits.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4">
        {visits.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No places yet"
            description="Add places from the trip's cities to build your daily itinerary"
            action={
              <button
                onClick={() => setShowAdd(true)}
                className="rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold"
              >
                Add Place
              </button>
            }
          />
        ) : (
          <>
            {visits.length > 1 && (
              <p className="mb-3 text-[10px] text-text-tertiary">
                Drag or use arrows to reorder
              </p>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visits.map((v) => String(v.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="pb-2">
                  {visits.map((visit, i) => (
                    <SortableVisitItem
                      key={String(visit.id)}
                      visit={visit}
                      index={i}
                      total={visits.length}
                      onMoveUp={() => handleMove(i, "up")}
                      onMoveDown={() => handleMove(i, "down")}
                      onToggleVisited={handleToggleVisited}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        {visits.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-bg py-3 text-sm font-medium text-text-secondary"
          >
            <Plus size={16} />
            Add Place
          </button>
        )}
      </div>

      <AddPlaceToSharedDaySheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        dayPlanId={dayPlan.id}
        cityIds={trip.city_ids}
        nextOrderIndex={visits.length}
      />
    </div>
  );
}
