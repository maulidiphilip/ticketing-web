"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginState = {
  email?: string;
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
};

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { email, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let auth: AuthResponse;
  try {
    auth = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: parsed.data,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        email,
        error: e.status === 401 ? "Wrong email or password." : e.message,
      };
    }
    throw e;
  }

  await createSession(
    {
      accessToken: auth.accessToken,
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    },
    auth.expiresInSeconds,
  );

  // redirect() must stay outside try/catch
  redirect(auth.role === "ATTENDEE" ? "/" : "/organizer");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
