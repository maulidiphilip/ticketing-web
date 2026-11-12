import "server-only";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventItem } from "@/lib/types";

export async function getMyEvents(): Promise<EventItem[]> {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    return await apiFetch<EventItem[]>("/api/events/mine", {
      token: session.accessToken,
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login");
    throw e;
  }
}

// Returns null when the event does not exist (or the id is not a valid UUID).
export async function getEvent(id: string): Promise<EventItem | null> {
  try {
    return await apiFetch<EventItem>(`/api/events/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}