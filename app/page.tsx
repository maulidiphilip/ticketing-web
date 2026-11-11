import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-semibold">Ticketing</h1>
      <p className="mt-2 text-sm">Buy and manage event tickets in Malawi.</p>
      <div className="mt-6 flex gap-4 text-sm underline">
        <Link href="/login">Organizer login</Link>
        <Link href="/organizer">Organizer area</Link>
      </div>
    </main>
  );
}
