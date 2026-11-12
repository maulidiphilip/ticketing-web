import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteEventButton } from "@/components/delete-event-button";
import { TicketTypesSection } from "@/components/ticket-types-section";
import { buttonVariants } from "@/components/ui/button";
import { getEvent } from "@/lib/events";
import { formatDateTime } from "@/lib/format";
import { getSession } from "@/lib/session";

async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEvent(id), getSession()]);
  if (!event) notFound();

  const canManage =
    session?.role === "ADMIN" || event.organizerId === session?.userId;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/organizer" className="text-sm underline">
          ← Back to events
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{event.title}</h1>
      </div>

      <dl className="grid max-w-xl grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="font-medium">Starts</dt>
        <dd>{formatDateTime(event.startsAt)} (Malawi time)</dd>
        <dt className="font-medium">Venue</dt>
        <dd>{event.venue}</dd>
        <dt className="font-medium">City</dt>
        <dd>{event.city}</dd>
        <dt className="font-medium">Description</dt>
        <dd>{event.description?.trim() || "No description"}</dd>
      </dl>

      {canManage ? (
        <div className="flex flex-wrap items-start gap-3">
          <Link
            href={`/organizer/events/${event.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit event
          </Link>
          <DeleteEventButton id={event.id} title={event.title} />
        </div>
      ) : (
        <p className="text-sm">You can view this event but not change it.</p>
      )}

      <Suspense fallback={<p className="text-sm">Loading ticket types…</p>}>
        <TicketTypesSection eventId={event.id} canManage={canManage} />
      </Suspense>
    </div>
  );
}

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm">Loading event…</p>}>
      <EventDetails params={params} />
    </Suspense>
  );
}
