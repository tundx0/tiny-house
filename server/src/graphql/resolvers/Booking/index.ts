import { Request } from "express";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { Booking, Database, Listing, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_NIGHTS = 90;
const MAX_DAYS_IN_ADVANCE = 365;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (value: string, label: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!DATE_PATTERN.test(value) || Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date (YYYY-MM-DD)`);
  }
  return date;
};

// Nights of a stay as bookingsIndex paths ("year.month.day", month 0-based).
// The check-out day itself stays free for the next guest.
const resolveBookedNights = (checkIn: Date, checkOut: Date): string[] => {
  const nights: string[] = [];
  for (
    let night = new Date(checkIn);
    night < checkOut;
    night = new Date(night.getTime() + DAY_IN_MS)
  ) {
    nights.push(
      `${night.getUTCFullYear()}.${night.getUTCMonth()}.${night.getUTCDate()}`
    );
  }
  return nights;
};

export const bookingResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      const { id, source } = input;

      const viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("viewer cannot be found");
      }

      if (!ObjectId.isValid(id)) {
        throw new Error("listing can't be found");
      }
      const listing = await db.listings.findOne({ _id: new ObjectId(id) });
      if (!listing) {
        throw new Error("listing can't be found");
      }
      if (listing.host === viewer._id) {
        throw new Error("viewer can't book own listing");
      }

      const checkIn = parseDate(input.checkIn, "check in");
      const checkOut = parseDate(input.checkOut, "check out");
      const now = new Date();
      const today = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      );

      if (checkIn.getTime() < today) {
        throw new Error("check in date can't be in the past");
      }
      if (checkOut <= checkIn) {
        throw new Error("check out date must be after check in date");
      }
      if (checkOut.getTime() - today > MAX_DAYS_IN_ADVANCE * DAY_IN_MS) {
        throw new Error(
          `bookings can only be made up to ${MAX_DAYS_IN_ADVANCE} days in advance`
        );
      }

      const nights = resolveBookedNights(checkIn, checkOut);
      if (nights.length > MAX_NIGHTS) {
        throw new Error(`a booking can't be longer than ${MAX_NIGHTS} nights`);
      }

      const host = await db.users.findOne({ _id: listing.host });
      if (!host || !host.walletId) {
        throw new Error(
          "the host either can't be found or is not connected with Stripe"
        );
      }

      // Reserve the nights atomically so two guests can't book the same dates.
      const nightPaths = nights.map((night) => `bookingsIndex.${night}`);
      const reserved = await db.listings.updateOne(
        {
          _id: listing._id,
          ...Object.fromEntries(
            nightPaths.map((path) => [path, { $exists: false }])
          ),
        },
        { $set: Object.fromEntries(nightPaths.map((path) => [path, true])) }
      );
      if (reserved.modifiedCount === 0) {
        throw new Error(
          "viewer can't book dates that have already been booked"
        );
      }

      const totalPrice = listing.price * nights.length;

      try {
        await Stripe.charge(totalPrice, source, host.walletId);
      } catch (error) {
        await db.listings.updateOne(
          { _id: listing._id },
          { $unset: Object.fromEntries(nightPaths.map((path) => [path, ""])) }
        );
        throw new Error(`Failed to charge booking: ${error}`);
      }

      const booking: Booking = {
        _id: new ObjectId(),
        listing: listing._id,
        tenant: viewer._id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
      };

      await db.bookings.insertOne(booking);
      await Promise.all([
        db.users.updateOne(
          { _id: host._id },
          { $inc: { income: totalPrice } }
        ),
        db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: booking._id } }
        ),
        db.listings.updateOne(
          { _id: listing._id },
          { $push: { bookings: booking._id } }
        ),
      ]);

      return booking;
    },
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: Record<string, never>,
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
    tenant: (
      booking: Booking,
      _args: Record<string, never>,
      { db }: { db: Database }
    ): Promise<User | null> => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};
