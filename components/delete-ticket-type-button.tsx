"use client";

import { useState, useTransition } from "react";
import { deleteTicketType } from "@/lib/ticket-type-actions";
import { Button } from "@/components/ui/button";

type Props = { eventId: string; id: string; name: string };

export function DeleteTicketTypeButton({ eventId, id, name }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Remove the "${name}" ticket type?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTicketType(eventId, id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Removing…" : "Remove"}
      </Button>
      {error && (
        <p role="alert" className="max-w-56 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}