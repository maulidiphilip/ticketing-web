const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Blantyre",
});

export function formatDateTime(iso: string): string {
  return formatter.format(new Date(iso));
}

// Malawi time (CAT) is UTC+02:00 all year. This gives the "YYYY-MM-DDTHH:mm"
// text that a datetime-local input expects.
export function toMalawiLocalInput(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

const numberFormatter = new Intl.NumberFormat("en-GB");

export function formatMwk(amount: number): string {
  return `MWK ${numberFormatter.format(amount)}`;
}

// Call this only after request-time data has been read (for example after `await connection()`).
export function isInPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}