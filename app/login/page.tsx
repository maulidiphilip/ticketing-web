import { Suspense } from "react";
import { LoginForm } from "./login-form";

type SearchParams = Promise<{ next?: string | string[] }>;

async function LoginCard({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : ""} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <LoginCard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}