import { Suspense } from "react";
import { RegisterForm } from "./register-form";

type SearchParams = Promise<{ next?: string | string[] }>;

async function RegisterCard({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return <RegisterForm next={typeof next === "string" ? next : ""} />;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <RegisterCard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}