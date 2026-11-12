import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyEvents } from "@/lib/events";
import { formatDateTime, isInPast } from "@/lib/format";

async function EventsTable() {
  await connection();
  const events = await getMyEvents();

  if (events.length === 0) {
    return (
      <p className="text-sm">
        You haven&apos;t created any events yet. Click &quot;Create event&quot; to
        add your first one.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Starts</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const isPast = isInPast(event.startsAt);
          return (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/organizer/events/${event.id}`}
                  className="underline"
                >
                  {event.title}
                </Link>
              </TableCell>
              <TableCell>{formatDateTime(event.startsAt)}</TableCell>
              <TableCell>
                {event.venue}
                <span className="block text-xs opacity-70">{event.city}</span>
              </TableCell>
              <TableCell>
                <Badge variant={isPast ? "outline" : "secondary"}>
                  {isPast ? "Past" : "Upcoming"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function OrganizerHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your events</h1>
        <Link href="/organizer/events/new" className={buttonVariants()}>
          Create event
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm">Loading events…</p>}>
        <EventsTable />
      </Suspense>
    </div>
  );
}