"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { TicketType } from "@/lib/types";

export type TicketTypeFormValues = {
  name: string;
  price: string;
  quantityTotal: string;
};

export type TicketTypeFormState = {
  values?: TicketTypeFormValues;
  error?: string;
  fieldErrors?: Partial<Record<keyof TicketTypeFormValues, string[]>>;
};

export type DeleteTicketTypeResult = { error?: string };

const ticketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .regex(/^\d+$/, "Enter whole kwacha, for example 5000")
    .transform(Number)
    .pipe(
      z
        .number()
        .min(1, "Price must be at least MWK 1")
        .max(1_000_000_000, "Price is too high"),
    ),
  quantityTotal: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Enter a whole number, for example 50")
    .transform(Number)
    .pipe(
      z
        .number()
        .min(1, "There must be at least 1 ticket")
        .max(100000, "At most 100,000 tickets"),
    ),
});

type Prepared =
  | { ok: false; state: TicketTypeFormState }
  | {
      ok: true;
      values: TicketTypeFormValues;
      body: { name: string; price: number; quantityTotal: number };
    };

function prepare(formData: FormData): Prepared {
  const values: TicketTypeFormValues = {
    name: String(formData.get("name") ?? ""),
    price: String(formData.get("price") ?? ""),
    quantityTotal: String(formData.get("quantityTotal") ?? ""),
  };

  const parsed = ticketTypeSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      state: { values, fieldErrors: z.flattenError(parsed.error).fieldErrors },
    };
  }
  return { ok: true, values, body: parsed.data };
}

function apiFailure(
  e: ApiError,
  values: TicketTypeFormValues,
): TicketTypeFormState {
  if (e.status === 401) redirect("/login");
  if (e.status === 403) {
    return {
      values,
      error: "You can only change ticket types for events you organize.",
    };
  }
  if (e.status === 404) {
    return { values, error: "This event or ticket type no longer exists." };
  }
  const fieldErrors = Object.fromEntries(
    Object.entries(e.fieldErrors).map(([field, message]) => [field, [message]]),
  ) as TicketTypeFormState["fieldErrors"];
  return { values, error: e.message, fieldErrors };
}

// Bound in the page: createTicketType.bind(null, eventId)
export async function createTicketType(
  eventId: string,
  _prev: TicketTypeFormState,
  formData: FormData,
): Promise<TicketTypeFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const prepared = prepare(formData);
  if (!prepared.ok) return prepared.state;

  try {
    await apiFetch<TicketType>(`/api/events/${eventId}/ticket-types`, {
      method: "POST",
      token: session.accessToken,
      body: prepared.body,
    });
  } catch (e) {
    if (e instanceof ApiError) return apiFailure(e, prepared.values);
    throw e;
  }

  redirect(`/organizer/events/${eventId}`);
}

// Bound in the page: updateTicketType.bind(null, eventId, ticketTypeId)
export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  _prev: TicketTypeFormState,
  formData: FormData,
): Promise<TicketTypeFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const prepared = prepare(formData);
  if (!prepared.ok) return prepared.state;

  try {
    await apiFetch<TicketType>(
      `/api/events/${eventId}/ticket-types/${ticketTypeId}`,
      {
        method: "PUT",
        token: session.accessToken,
        body: prepared.body,
      },
    );
  } catch (e) {
    if (e instanceof ApiError) return apiFailure(e, prepared.values);
    throw e;
  }

  redirect(`/organizer/events/${eventId}`);
}

export async function deleteTicketType(
  eventId: string,
  ticketTypeId: string,
): Promise<DeleteTicketTypeResult> {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    await apiFetch<void>(`/api/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: "DELETE",
      token: session.accessToken,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) redirect("/login");
      if (e.status === 403) {
        return { error: "You can only change ticket types for your own events." };
      }
      if (e.status === 404) redirect(`/organizer/events/${eventId}`);
      return { error: e.message };
    }
    throw e;
  }

  redirect(`/organizer/events/${eventId}`);
}