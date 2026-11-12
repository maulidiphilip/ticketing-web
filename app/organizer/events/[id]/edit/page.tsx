import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventForm } from "@/components/event-form";
import { updateEvent, type EventFormValues } from "@/lib/event-actions";
import { getEvent } from "@/lib/events";
import { toMalawiLocalInput } from "@/lib/format";
import { getSession } from "@/lib/session";

async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEvent(id), getSession()]);
  if (!event) notFound();

  const canManage =
    session?.role === "ADMIN" || event.organizerId === session?.userId;
  if (!canManage) {
    return (
      <p className="text-sm">You can only edit events that you organize.</p>
    );
  }

  const initialValues: EventFormValues = {
    title: event.title,
    description: event.description?.trim() ?? "",
    venue: event.venue,
    city: event.city,
    startsAt: toMalawiLocalInput(event.startsAt),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/organizer/events/${event.id}`} className="text-sm underline">
          ← Back to event
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit event</h1>
      </div>
      <EventForm
        action={updateEvent.bind(null, event.id)}
        initialValues={initialValues}
        submitLabel="Save changes"
        cancelHref={`/organizer/events/${event.id}`}
      />
    </div>
  );
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm">Loading event…</p>}>
      <EditEvent params={params} />
    </Suspense>
  );
}