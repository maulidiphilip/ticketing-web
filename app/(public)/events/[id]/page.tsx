import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getEvent } from "@/lib/events";
import { formatDateTime, formatMwk, isInPast } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getTicketTypes } from "@/lib/ticket-types";

async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [event, ticketTypes, session] = await Promise.all([
    getEvent(id),
    getTicketTypes(id),
    getSession(),
  ]);
  if (!event) notFound();

  const started = isInPast(event.startsAt);
  const nextParam = encodeURIComponent(`/events/${event.id}`);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/" className="text-sm underline">
          ← All events
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">{event.title}</h1>
        <p className="mt-1 text-sm">
          {formatDateTime(event.startsAt)} (Malawi time)
        </p>
      </div>

      <dl className="grid max-w-xl grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="font-medium">Venue</dt>
        <dd>{event.venue}</dd>
        <dt className="font-medium">City</dt>
        <dd>{event.city}</dd>
      </dl>

      {event.description?.trim() && (
        <p className="max-w-2xl whitespace-pre-line text-sm">
          {event.description.trim()}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Tickets</h2>

        {started ? (
          <p className="text-sm">
            This event has already started. Tickets are no longer on sale.
          </p>
        ) : ticketTypes.length === 0 ? (
          <p className="text-sm">Tickets are not on sale yet.</p>
        ) : (
          <>
            <ul className="flex max-w-xl flex-col gap-3">
              {ticketTypes.map((ticketType) => (
                <li
                  key={ticketType.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{ticketType.name}</p>
                    <p className="text-sm">{formatMwk(ticketType.price)}</p>
                  </div>
                  {ticketType.quantityAvailable > 0 ? (
                    <Badge variant="secondary">
                      {ticketType.quantityAvailable} available
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sold out</Badge>
                  )}
                </li>
              ))}
            </ul>

            {!session && (
              <div className="max-w-xl rounded-lg border bg-muted p-4 text-sm">
                <p>Log in or create an account to buy tickets.</p>
                <div className="mt-3 flex gap-3">
                  <Link
                    href={`/login?next=${nextParam}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Log in
                  </Link>
                  <Link
                    href={`/register?next=${nextParam}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function PublicEventPage({
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