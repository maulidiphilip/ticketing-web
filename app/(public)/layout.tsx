import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";
import { getSession } from "@/lib/session";

async function AuthNav() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Log in
        </Link>
        <Link href="/register" className={buttonVariants({ size: "sm" })}>
          Create account
        </Link>
      </div>
    );
  }

  const isOrganizer = session.role === "ORGANIZER" || session.role === "ADMIN";

  return (
    <div className="flex items-center gap-3 text-sm">
      {isOrganizer && (
        <Link href="/organizer" className="underline">
          Organizer area
        </Link>
      )}
      <span>{session.fullName}</span>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="font-semibold">
            Ticketing
          </Link>
          <Suspense fallback={<span className="text-sm">…</span>}>
            <AuthNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
