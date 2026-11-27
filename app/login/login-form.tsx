"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "@/lib/auth-actions";
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

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    login,
    initialState,
  );
  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Welcome back. Log in to buy tickets or manage your events.
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
              autoComplete="current-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-red-700">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Log in"}
          </Button>

          <p className="text-sm">
            No account yet?{" "}
            <Link href={registerHref} className="underline">
              Create one
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