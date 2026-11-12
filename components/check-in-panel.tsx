"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { checkInTicket, type CheckInResult } from "@/lib/check-in-actions";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HistoryItem = { id: number; result: CheckInResult; at: string };

export function CheckInPanel({ eventId }: { eventId: string }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [admitted, setAdmitted] = useState(0);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    const submitted = code;
    if (!submitted.trim()) {
      setResult({ ok: false, message: "Enter or scan a ticket code." });
      return;
    }

    const id = nextId.current++;
    startTransition(async () => {
      const res = await checkInTicket(eventId, submitted);
      setResult(res);
      setHistory((previous) =>
        [{ id, result: res, at: new Date().toISOString() }, ...previous].slice(0, 8),
      );
      if (res.ok) setAdmitted((n) => n + 1);
      setCode("");
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Label htmlFor="code">Ticket code</Label>
        <Input
          id="code"
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Scan or paste the code, then press Enter"
          className="h-12 font-mono text-lg"
        />
        <Button type="submit" disabled={pending} className="h-12 text-base">
          {pending ? "Checking…" : "Check in"}
        </Button>
      </form>

      <div role="status" aria-live="polite">
        {result && result.ok && (
          <div className="rounded-lg border-2 border-green-700 bg-green-100 p-5 text-green-950">
            <p className="text-3xl font-bold">ADMIT</p>
            <p className="mt-2 text-xl font-semibold">{result.holderName}</p>
            <p className="text-base">{result.ticketTypeName}</p>
            <p className="mt-1 text-sm">
              Checked in at {formatDateTime(result.checkedInAt)}
            </p>
          </div>
        )}
        {result && !result.ok && (
          <div className="rounded-lg border-2 border-red-700 bg-red-100 p-5 text-red-950">
            <p className="text-3xl font-bold">DO NOT ADMIT</p>
            <p className="mt-2 text-lg">{result.message}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium">Admitted in this session: {admitted}</p>
        {history.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {history.map((item) => (
              <li
                key={item.id}
                className={
                  item.result.ok
                    ? "rounded border border-green-700 bg-green-50 px-3 py-2 text-green-950"
                    : "rounded border border-red-700 bg-red-50 px-3 py-2 text-red-950"
                }
              >
                {item.result.ok
                  ? `Admitted: ${item.result.holderName} (${item.result.ticketTypeName})`
                  : `Refused: ${item.result.message}`}
                <span className="block text-xs opacity-80">
                  {formatDateTime(item.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}