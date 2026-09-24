import React from "react";
import { Link } from "react-router-dom";
import { Viewer } from "@/types";
import {
  addDays,
  countNights,
  formatPrice,
  hasBookingConflict,
  parseBookingsIndex,
  toDateInput,
  todayUTC,
} from "@/lib/utils";

export const MAX_NIGHTS = 90;
const MAX_DAYS_IN_ADVANCE = 365;

interface Props {
  viewer: Viewer;
  hostId: string;
  hostHasWallet: boolean;
  price: number;
  bookingsIndex: string;
  checkIn: string;
  checkOut: string;
  setCheckIn: (value: string) => void;
  setCheckOut: (value: string) => void;
  onRequestBooking: () => void;
}

export const ListingCreateBooking: React.FC<Props> = ({
  viewer,
  hostId,
  hostHasWallet,
  price,
  bookingsIndex,
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  onRequestBooking,
}) => {
  const today = todayUTC();
  const minDate = toDateInput(today);
  const maxDate = toDateInput(addDays(today, MAX_DAYS_IN_ADVANCE));
  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : 0;
  const index = parseBookingsIndex(bookingsIndex);

  let blocker: React.ReactNode = null;
  if (!viewer.id) {
    blocker = (
      <>
        You have to be{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          signed in
        </Link>{" "}
        to book a listing.
      </>
    );
  } else if (viewer.id === hostId) {
    blocker = "You can't book your own listing.";
  } else if (!hostHasWallet) {
    blocker =
      "The host has disconnected from Stripe and can't receive payments right now.";
  }

  let dateError: string | null = null;
  if (checkIn && checkOut) {
    if (nights <= 0) {
      dateError = "Check out must be after check in.";
    } else if (nights > MAX_NIGHTS) {
      dateError = `Stays are limited to ${MAX_NIGHTS} nights.`;
    } else if (hasBookingConflict(index, checkIn, checkOut)) {
      dateError =
        "Some of the selected dates are already booked. Please choose different dates.";
    }
  }

  const canBook = !blocker && !!checkIn && !!checkOut && !dateError;

  return (
    <div className="rounded-lg border border-gray-200 shadow-lg p-6 bg-white">
      <p className="text-2xl font-bold text-gray-900">
        {formatPrice(price)}
        <span className="text-base font-normal text-gray-500"> / night</span>
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-gray-600">
            Check in
          </span>
          <input
            type="date"
            value={checkIn}
            min={minDate}
            max={maxDate}
            disabled={!!blocker}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) setCheckOut("");
            }}
            className="mt-1 w-full border border-gray-300 rounded px-2 py-2 disabled:bg-gray-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-gray-600">
            Check out
          </span>
          <input
            type="date"
            value={checkOut}
            min={
              checkIn
                ? toDateInput(addDays(new Date(`${checkIn}T00:00:00Z`), 1))
                : minDate
            }
            max={maxDate}
            disabled={!!blocker || !checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-2 py-2 disabled:bg-gray-100"
          />
        </label>
      </div>

      {dateError && <p className="text-sm text-red-600 mt-3">{dateError}</p>}

      {canBook && (
        <div className="mt-4 space-y-1 text-gray-700">
          <div className="flex justify-between">
            <span>
              {formatPrice(price, false)} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span>{formatPrice(price * nights, false)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{formatPrice(price * nights, false)}</span>
          </div>
        </div>
      )}

      <button
        onClick={onRequestBooking}
        disabled={!canBook}
        className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request to book
      </button>

      {blocker && <p className="text-sm text-gray-600 mt-3">{blocker}</p>}
    </div>
  );
};
