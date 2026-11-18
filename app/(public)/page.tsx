import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUpcomingEvents } from "@/lib/events";
import { formatDateTime } from "@/lib/format";

async function EventList() {
  const events = await getUpcomingEvents();

  if (events.length === 0) {
    return (
      <p className="text-sm">No upcoming events right now. Check back soon.</p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <li key={event.id}>
          <Link href={`/events/${event.id}`} className="block h-full">
            <Card className="h-full transition hover:shadow-md">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{formatDateTime(event.startsAt)}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{event.venue}</p>
                <p className="opacity-70">{event.city}</p>
                {event.description?.trim() && (
                  <p className="mt-2 line-clamp-2">{event.description.trim()}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Upcoming events</h1>
        <p className="mt-1 text-sm">Find an event and get your tickets.</p>
      </div>
      <Suspense fallback={<p className="text-sm">Loading events…</p>}>
        <EventList />
      </Suspense>
    </div>
  );
}