import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckInPanel } from "@/components/check-in-panel";
import { getEvent } from "@/lib/events";
import { formatDateTime } from "@/lib/format";
import { getSession } from "@/lib/session";

async function CheckInContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEvent(id), getSession()]);
  if (!event) notFound();

  const canManage =
    session?.role === "ADMIN" || event.organizerId === session?.userId;
  if (!canManage) {
    return (
      <p className="text-sm">
        Only the organizer of this event can check tickets in.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/organizer/events/${event.id}`} className="text-sm underline">
          ← Back to event
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Check-in</h1>
        <p className="text-sm">
          {event.title} · {formatDateTime(event.startsAt)} (Malawi time)
        </p>
      </div>
      <CheckInPanel eventId={event.id} />
    </div>
  );
}

export default function CheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm">Loading check-in…</p>}>
      <CheckInContent params={params} />
    </Suspense>
  );
}