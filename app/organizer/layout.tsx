import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth-actions";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

async function OrganizerShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "ORGANIZER" && session.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-lg p-8">
        <h1 className="text-xl font-semibold">Organizers only</h1>
        <p className="mt-2 text-sm">
          {session.email} is an attendee account, so it can&apos;t manage
          events. Sign in with an organizer account instead.
        </p>
        <form action={logout} className="mt-4">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="font-semibold">Ticketing · Organizer</span>
          <div className="flex items-center gap-3">
            <span className="text-sm">{session.fullName}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <OrganizerShell>{children}</OrganizerShell>
    </Suspense>
  );
}