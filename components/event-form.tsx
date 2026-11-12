"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EventFormState, EventFormValues } from "@/lib/event-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  initialValues?: EventFormValues;
  submitLabel: string;
  cancelHref?: string;
};

const emptyValues: EventFormValues = {
  title: "",
  description: "",
  venue: "",
  city: "",
  startsAt: "",
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-red-700">{messages[0]}</p>;
}

export function EventForm({
  action,
  initialValues = emptyValues,
  submitLabel,
  cancelHref = "/organizer",
}: Props) {
  const [state, formAction, pending] = useActionState<EventFormState, FormData>(
    action,
    { values: initialValues },
  );
  const values = state.values ?? initialValues;
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-900"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          maxLength={200}
          defaultValue={values.title}
          required
        />
        <FieldError messages={errors?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={values.description}
        />
        <FieldError messages={errors?.description} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" defaultValue={values.venue} required />
        <FieldError messages={errors?.venue} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" defaultValue={values.city} required />
        <FieldError messages={errors?.city} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startsAt">Starts at (Malawi time)</Label>
        <Input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          defaultValue={values.startsAt}
          required
        />
        <FieldError messages={errors?.startsAt} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}