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
import { useTrip, useDayPlan, usePlaceVisits, reorderVisits, deletePlaceVisit } from "@/db/hooks";
import { formatDate } from "@/lib/utils";
import { PlaceVisitRow } from "@/components/trips/PlaceVisitRow";
import { AddPlaceToDaySheet } from "@/components/sheets/AddPlaceToDaySheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PlaceVisit } from "@/types/trip";

function SortableVisitItem({
  visit,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  visit: PlaceVisit;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: visit.id,
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
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default function DayPlanPage() {
  const { tripId, dayNumber } = useParams<{ tripId: string; dayNumber: string }>();
  const numDay = Number(dayNumber);
  const trip = useTrip(tripId);
  const dayPlan = useDayPlan(tripId, numDay);
  const allVisits = usePlaceVisits(dayPlan?.id);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const visits = allVisits.filter((v) => !deletedIds.has(v.id));
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
    await deletePlaceVisit(id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  if (!trip || !dayPlan) return <div className="p-4 text-text-secondary">Loading...</div>;

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newVisits = [...visits];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newVisits.length) return;
    [newVisits[index], newVisits[swapIndex]] = [newVisits[swapIndex], newVisits[index]];
    await reorderVisits(
      newVisits.map((v, i) => ({ id: v.id, order_index: i }))
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visits.findIndex((v) => v.id === active.id);
    const newIndex = visits.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newVisits = [...visits];
    const [moved] = newVisits.splice(oldIndex, 1);
    newVisits.splice(newIndex, 0, moved);
    await reorderVisits(
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
                items={visits.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="pb-2">
                  {visits.map((visit, i) => (
                    <SortableVisitItem
                      key={visit.id}
                      visit={visit}
                      index={i}
                      total={visits.length}
                      onMoveUp={() => handleMove(i, "up")}
                      onMoveDown={() => handleMove(i, "down")}
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

      <AddPlaceToDaySheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        dayPlanId={dayPlan.id}
        cityIds={trip.city_ids}
        nextOrderIndex={visits.length}
      />
    </div>
  );
}
