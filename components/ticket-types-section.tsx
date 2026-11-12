import Link from "next/link";
import { DeleteTicketTypeButton } from "@/components/delete-ticket-type-button";
import { TicketTypeForm } from "@/components/ticket-type-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMwk } from "@/lib/format";
import { createTicketType } from "@/lib/ticket-type-actions";
import { getTicketTypes } from "@/lib/ticket-types";

type Props = { eventId: string; canManage: boolean };

export async function TicketTypesSection({ eventId, canManage }: Props) {
  const ticketTypes = await getTicketTypes(eventId);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Ticket types</h2>
        <p className="mt-1 text-sm">
          &quot;Sold or held&quot; includes tickets reserved by unpaid orders for
          up to 15 minutes.
        </p>
      </div>

      {ticketTypes.length === 0 ? (
        <p className="text-sm">
          No ticket types yet. Buyers can&apos;t order until you add at least one.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sold or held</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Total</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketTypes.map((ticketType) => (
              <TableRow key={ticketType.id}>
                <TableCell className="font-medium">{ticketType.name}</TableCell>
                <TableCell>{formatMwk(ticketType.price)}</TableCell>
                <TableCell>{ticketType.quantitySold}</TableCell>
                <TableCell>{ticketType.quantityAvailable}</TableCell>
                <TableCell>{ticketType.quantityTotal}</TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/organizer/events/${eventId}/ticket-types/${ticketType.id}/edit`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Edit
                      </Link>
                      <DeleteTicketTypeButton
                        eventId={eventId}
                        id={ticketType.id}
                        name={ticketType.name}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {canManage && (
        <div className="flex flex-col gap-3">
          <h3 className="font-medium">Add a ticket type</h3>
          <TicketTypeForm
            action={createTicketType.bind(null, eventId)}
            submitLabel="Add ticket type"
          />
        </div>
      )}
    </section>
  );
}