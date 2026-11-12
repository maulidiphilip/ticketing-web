"use client";

import { useState, useTransition } from "react";
import { deleteEvent } from "@/lib/event-actions";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteEvent(id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="destructive" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting…" : "Delete event"}
      </Button>
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-900"
        >
          {error}
        </p>
      )}
    </div>
  );
}