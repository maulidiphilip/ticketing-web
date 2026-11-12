"use client";

import { Button } from "@/components/ui/button";

export default function OrganizerError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm">
        We couldn&apos;t load this page. Check that the ticketing server is
        running, then try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}