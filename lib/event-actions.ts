"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventItem } from "@/lib/types";

export type EventFormValues = {
  title: string;
  description: string;
  venue: string;
  city: string;
  startsAt: string;
};

export type EventFormState = {
  values?: EventFormValues;
  error?: string;
  fieldErrors?: Partial<Record<keyof EventFormValues, string[]>>;
};

export type DeleteEventResult = { error?: string };

const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters"),
  venue: z.string().trim().min(1, "Venue is required"),
  city: z.string().trim().min(1, "City is required"),
  startsAt: z.string().min(1, "Pick a date and time"),
});

// The form's date and time is entered in Malawi time (CAT, UTC+02:00, no daylight saving).
function malawiTimeToUtcIso(local: string): string | null {
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  const date = new Date(`${withSeconds}+02:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

type PreparedEvent =
  | { ok: false; state: EventFormState }
  | {
      ok: true;
      values: EventFormValues;
      body: {
        title: string;
        description?: string;
        venue: string;
        city: string;
        startsAt: string;
      };
    };

function prepareEvent(formData: FormData, requireFuture: boolean): PreparedEvent {
  const values: EventFormValues = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    venue: String(formData.get("venue") ?? ""),
    city: String(formData.get("city") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
  };

  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      state: { values, fieldErrors: z.flattenError(parsed.error).fieldErrors },
    };
  }

  const startsAt = malawiTimeToUtcIso(parsed.data.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      state: { values, fieldErrors: { startsAt: ["Enter a valid date and time"] } },
    };
  }
  if (requireFuture && new Date(startsAt).getTime() <= Date.now()) {
    return {
      ok: false,
      state: {
        values,
        fieldErrors: { startsAt: ["The start time must be in the future"] },
      },
    };
  }

  return {
    ok: true,
    values,
    body: {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      venue: parsed.data.venue,
      city: parsed.data.city,
      startsAt,
    },
  };
}

function apiFailure(e: ApiError, values: EventFormValues): EventFormState {
  if (e.status === 401) redirect("/login");
  if (e.status === 403) {
    return {
      values,
      error: "You can only change events you organize. Sign in with the right account.",
    };
  }
  if (e.status === 404) {
    return { values, error: "This event no longer exists." };
  }
  const fieldErrors = Object.fromEntries(
    Object.entries(e.fieldErrors).map(([field, message]) => [field, [message]]),
  ) as EventFormState["fieldErrors"];
  return { values, error: e.message, fieldErrors };
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const prepared = prepareEvent(formData, true);
  if (!prepared.ok) return prepared.state;

  let created: EventItem;
  try {
    created = await apiFetch<EventItem>("/api/events", {
      method: "POST",
      token: session.accessToken,
      body: prepared.body,
    });
  } catch (e) {
    if (e instanceof ApiError) return apiFailure(e, prepared.values);
    throw e;
  }

  redirect(`/organizer/events/${created.id}`);
}

// Bound to an event id in the edit page: updateEvent.bind(null, id).
// The API allows a start time in the past here, so typos can be fixed after an event has started.
export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const prepared = prepareEvent(formData, false);
  if (!prepared.ok) return prepared.state;

  try {
    await apiFetch<EventItem>(`/api/events/${id}`, {
      method: "PUT",
      token: session.accessToken,
      body: prepared.body,
    });
  } catch (e) {
    if (e instanceof ApiError) return apiFailure(e, prepared.values);
    throw e;
  }

  redirect(`/organizer/events/${id}`);
}

export async function deleteEvent(id: string): Promise<DeleteEventResult> {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    await apiFetch<void>(`/api/events/${id}`, {
      method: "DELETE",
      token: session.accessToken,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) redirect("/login");
      if (e.status === 404) redirect("/organizer");
      if (e.status === 403) {
        return { error: "You can only delete events you organize." };
      }
      return { error: e.message };
    }
    throw e;
  }

  redirect("/organizer");
}