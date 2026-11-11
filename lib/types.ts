export type Role = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  city: string;
  startsAt: string;
  organizerId: string;
  createdAt: string;
};

export type TicketType = {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  quantityAvailable: number;
};
