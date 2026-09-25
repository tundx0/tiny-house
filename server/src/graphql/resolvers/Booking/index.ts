import { Request } from "express";
import { ObjectId } from "mongodb";
import { PaymentFailedError, Stripe } from "../../../lib/api";
import {
  Booking,
  BookingStatus,
  Database,
  Listing,
  User,
} from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_NIGHTS = 90;
const MAX_DAYS_IN_ADVANCE = 365;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (value: string, label: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`);
  // Date normalizes out of range days (2026-02-31 -> 2026-03-03), so the
  // parsed date must format back to exactly the input.
  if (
    !DATE_PATTERN.test(value) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
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
      const releaseNights = () =>
        db.listings.updateOne(
          { _id: listing._id },
          { $unset: Object.fromEntries(nightPaths.map((path) => [path, ""])) }
        );

      const booking: Booking = {
        _id: new ObjectId(),
        listing: listing._id,
        tenant: viewer._id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        status: BookingStatus.Pending,
      };

      try {
        await db.bookings.insertOne(booking);
      } catch (error) {
        await releaseNights();
        throw new Error(`Failed to create booking: ${error}`);
      }

      let paymentIntent: string;
      try {
        paymentIntent = await Stripe.charge(
          totalPrice,
          source,
          host.walletId,
          booking._id.toString()
        );
      } catch (error) {
        if (error instanceof PaymentFailedError) {
          await Promise.all([
            releaseNights(),
            db.bookings.deleteOne({ _id: booking._id }),
          ]);
          throw new Error(`Failed to charge booking: ${error.message}`);
        }
        // The charge may or may not have gone through, so keep the pending
        // booking and its nights until it's reconciled with Stripe.
        console.error(
          `[booking ${booking._id}] payment outcome unknown:`,
          error
        );
        throw new Error(
          "We couldn't confirm your payment. Your dates are on hold; please contact support before trying again."
        );
      }

      // Finalize step by step so a failure can undo exactly what was applied
      // before refunding the charge.
      const undo: (() => Promise<unknown>)[] = [];
      const steps: [() => Promise<unknown>, () => Promise<unknown>][] = [
        [
          () =>
            db.bookings.updateOne(
              { _id: booking._id },
              { $set: { status: BookingStatus.Confirmed, paymentIntent } }
            ),
          () => db.bookings.deleteOne({ _id: booking._id }),
        ],
        [
          () =>
            db.users.updateOne(
              { _id: host._id },
              { $inc: { income: totalPrice } }
            ),
          () =>
            db.users.updateOne(
              { _id: host._id },
              { $inc: { income: -totalPrice } }
            ),
        ],
        [
          () =>
            db.users.updateOne(
              { _id: viewer._id },
              { $push: { bookings: booking._id } }
            ),
          () =>
            db.users.updateOne(
              { _id: viewer._id },
              { $pull: { bookings: booking._id } }
            ),
        ],
        [
          () =>
            db.listings.updateOne(
              { _id: listing._id },
              { $push: { bookings: booking._id } }
            ),
          () =>
            db.listings.updateOne(
              { _id: listing._id },
              { $pull: { bookings: booking._id } }
            ),
        ],
      ];

      try {
        for (const [apply, revert] of steps) {
          await apply();
          undo.unshift(revert);
        }
      } catch (error) {
        console.error(`[booking ${booking._id}] failed to finalize:`, error);
        try {
          await Stripe.refund(paymentIntent);
        } catch (refundError) {
          // Leave the booking and nights in place so the paid stay isn't lost.
          console.error(
            `[booking ${booking._id}] refund failed (payment ${paymentIntent}):`,
            refundError
          );
          throw new Error(
            "Your payment went through but we couldn't save your booking. Please contact support."
          );
        }
        for (const revert of undo) {
          await revert().catch((undoError) =>
            console.error(`[booking ${booking._id}] undo failed:`, undoError)
          );
        }
        await Promise.all([
          releaseNights(),
          db.bookings.deleteOne({ _id: booking._id }),
        ]);
        throw new Error(
          "We couldn't save your booking, so your payment has been refunded."
        );
      }

      booking.status = BookingStatus.Confirmed;
      booking.paymentIntent = paymentIntent;
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
