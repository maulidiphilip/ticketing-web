"use client";

import Link from "next/link";
import { useActionState } from "react";
import type {
  TicketTypeFormState,
  TicketTypeFormValues,
} from "@/lib/ticket-type-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  action: (
    prev: TicketTypeFormState,
    formData: FormData,
  ) => Promise<TicketTypeFormState>;
  initialValues?: TicketTypeFormValues;
  submitLabel: string;
  cancelHref?: string;
};

const emptyValues: TicketTypeFormValues = {
  name: "",
  price: "",
  quantityTotal: "",
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-red-700">{messages[0]}</p>;
}

export function TicketTypeForm({
  action,
  initialValues = emptyValues,
  submitLabel,
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState<
    TicketTypeFormState,
    FormData
  >(action, { values: initialValues });
  const values = state.values ?? initialValues;
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-900"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="General, VIP, Early bird…"
          maxLength={100}
          defaultValue={values.name}
          required
        />
        <FieldError messages={errors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price (MWK)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={values.price}
            required
          />
          <FieldError messages={errors?.price} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="quantityTotal">Number of tickets</Label>
          <Input
            id="quantityTotal"
            name="quantityTotal"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            step={1}
            defaultValue={values.quantityTotal}
            required
          />
          <FieldError messages={errors?.quantityTotal} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {cancelHref && (
          <Link
            href={cancelHref}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}