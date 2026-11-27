"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthFormState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    register,
    initialState,
  );
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Buy tickets and keep them all in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          {state.error && (
            <p
              role="alert"
              className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-900"
            >
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              maxLength={100}
              defaultValue={state.fullName}
              required
            />
            {state.fieldErrors?.fullName && (
              <p className="text-sm text-red-700">
                {state.fieldErrors.fullName[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-sm text-red-700">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
            <p className="text-xs">At least 8 characters.</p>
            {state.fieldErrors?.password && (
              <p className="text-sm text-red-700">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-sm">
            Already have an account?{" "}
            <Link href={loginHref} className="underline">
              Log in
            </Link>
          </p>
          <Link href="/" className="text-sm underline">
            ← Back to events
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}