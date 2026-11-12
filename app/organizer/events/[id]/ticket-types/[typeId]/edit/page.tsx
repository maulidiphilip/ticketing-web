import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TicketTypeForm } from "@/components/ticket-type-form";
import { getEvent } from "@/lib/events";
import { getSession } from "@/lib/session";
import {
  updateTicketType,
  type TicketTypeFormValues,
} from "@/lib/ticket-type-actions";
import { getTicketTypes } from "@/lib/ticket-types";

async function EditTicketType({
  params,
}: {
  params: Promise<{ id: string; typeId: string }>;
}) {
  const { id, typeId } = await params;
  const [event, ticketTypes, session] = await Promise.all([
    getEvent(id),
    getTicketTypes(id),
    getSession(),
  ]);
  if (!event) notFound();

  const ticketType = ticketTypes.find((t) => t.id === typeId);
  if (!ticketType) notFound();

  const canManage =
    session?.role === "ADMIN" || event.organizerId === session?.userId;
  if (!canManage) {
    return (
      <p className="text-sm">
        You can only edit ticket types for events that you organize.
      </p>
    );
  }

  const initialValues: TicketTypeFormValues = {
    name: ticketType.name,
    price: String(ticketType.price),
    quantityTotal: String(ticketType.quantityTotal),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/organizer/events/${event.id}`}
          className="text-sm underline"
        >
          ← Back to {event.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          Edit ticket type: {ticketType.name}
        </h1>
        <p className="mt-1 text-sm">
          {ticketType.quantitySold} sold or held. The number of tickets
          can&apos;t go below that.
        </p>
      </div>
      <TicketTypeForm
        action={updateTicketType.bind(null, event.id, ticketType.id)}
        initialValues={initialValues}
        submitLabel="Save changes"
        cancelHref={`/organizer/events/${event.id}`}
      />
    </div>
  );
}

export default function EditTicketTypePage({
  params,
}: {
  params: Promise<{ id: string; typeId: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm">Loading ticket type…</p>}>
      <EditTicketType params={params} />
    </Suspense>
  );
}
