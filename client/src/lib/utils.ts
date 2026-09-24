const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Prices are stored in cents on the server.
export const formatPrice = (cents: number, round = true): string => {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: round ? 0 : 2,
    maximumFractionDigits: round ? 0 : 2,
  })}`;
};

// Date input values ("YYYY-MM-DD") are treated as UTC days.
export const parseDateInput = (value: string): Date =>
  new Date(`${value}T00:00:00.000Z`);

export const toDateInput = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_IN_MS);

export const todayUTC = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

export const countNights = (checkIn: string, checkOut: string): number =>
  Math.round(
    (parseDateInput(checkOut).getTime() - parseDateInput(checkIn).getTime()) /
      DAY_IN_MS,
  );

export const formatDate = (value: string): string =>
  parseDateInput(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

type BookingsIndex = Record<string, Record<string, Record<string, boolean>>>;

export const parseBookingsIndex = (raw: string): BookingsIndex => {
  try {
    return JSON.parse(raw) as BookingsIndex;
  } catch {
    return {};
  }
};

export const isNightBooked = (index: BookingsIndex, night: Date): boolean =>
  !!index[night.getUTCFullYear()]?.[night.getUTCMonth()]?.[night.getUTCDate()];

// Returns true if any night between check in (inclusive) and check out
// (exclusive) is already booked.
export const hasBookingConflict = (
  index: BookingsIndex,
  checkIn: string,
  checkOut: string,
): boolean => {
  const end = parseDateInput(checkOut);
  for (
    let night = parseDateInput(checkIn);
    night < end;
    night = addDays(night, 1)
  ) {
    if (isNightBooked(index, night)) return true;
  }
  return false;
};

export const stripeAuthUrl = (): string | null => {
  const clientId = import.meta.env.VITE_S_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
  });
  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
};
