"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";

export type CheckInResult =
  | {
      ok: true;
      ticketTypeName: string;
      holderName: string;
      checkedInAt: string;
    }
  | { ok: false; message: string };

type CheckInResponse = {
  ticketId: string;
  ticketTypeName: string;
  holderName: string;
  checkedInAt: string;
};

export async function checkInTicket(
  eventId: string,
  rawCode: string,
): Promise<CheckInResult> {
  const session = await getSession();
  if (!session) redirect("/login");

  const code = rawCode.trim();
  if (!code) return { ok: false, message: "Enter or scan a ticket code." };

  try {
    const response = await apiFetch<CheckInResponse>(
      `/api/events/${eventId}/check-in`,
      {
        method: "POST",
        token: session.accessToken,
        body: { code },
      },
    );
    return {
      ok: true,
      ticketTypeName: response.ticketTypeName,
      holderName: response.holderName,
      checkedInAt: response.checkedInAt,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) redirect("/login");
      if (e.status === 403) {
        return { ok: false, message: "You are not the organizer of this event." };
      }
      if (e.status === 404) {
        return {
          ok: false,
          message: "Unknown ticket code, or this event no longer exists.",
        };
      }
      // 409 messages from the API explain the reason (wrong event, already used, not valid)
      return { ok: false, message: e.message };
    }
    throw e;
  }
}