import Link from "next/link";
import { EventForm } from "@/components/event-form";
import { createEvent } from "@/lib/event-actions";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/organizer" className="text-sm underline">
          ← Back to events
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Create event</h1>
      </div>
      <EventForm action={createEvent} submitLabel="Create event" />
    </div>
  );
}
