"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";

export type AuthFormState = {
  email?: string;
  fullName?: string;
  error?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password", string[]>>;
};

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .max(255, "Email must be at most 255 characters")
    .pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

// Only allow redirects to a path on this site, never to another website.
function safeNext(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return value;
}

async function startSession(auth: AuthResponse) {
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
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

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

  await startSession(auth);

  // redirect() must stay outside try/catch
  redirect(next ?? (auth.role === "ATTENDEE" ? "/" : "/organizer"));
}

export async function register(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const parsed = registerSchema.safeParse({ fullName, email, password });
  if (!parsed.success) {
    return {
      fullName,
      email,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  let auth: AuthResponse;
  try {
    auth = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: parsed.data,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 409) {
        return {
          fullName,
          email,
          fieldErrors: { email: ["An account with this email already exists."] },
        };
      }
      const fieldErrors = Object.fromEntries(
        Object.entries(e.fieldErrors).map(([field, message]) => [field, [message]]),
      ) as AuthFormState["fieldErrors"];
      return { fullName, email, error: e.message, fieldErrors };
    }
    throw e;
  }

  await startSession(auth);
  redirect(next ?? "/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}