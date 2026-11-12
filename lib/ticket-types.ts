import "server-only";
import { ApiError, apiFetch } from "@/lib/api";
import type { TicketType } from "@/lib/types";

// Public endpoint, sorted by price (cheapest first).
export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  try {
    return await apiFetch<TicketType[]>(`/api/events/${eventId}/ticket-types`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return [];
    }
    throw e;
  }
}
