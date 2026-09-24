import React from "react";
import { Link } from "react-router-dom";
import { ListingQuery } from "@/__generated__/graphql";
import { formatDate } from "@/lib/utils";
import { Pagination } from "../common/Pagination";

type Bookings = NonNullable<ListingQuery["listing"]["bookings"]>;

interface Props {
  bookings: Bookings;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const ListingBookings: React.FC<Props> = ({
  bookings,
  page,
  limit,
  onPageChange,
}) => {
  const totalPages = Math.ceil(bookings.total / limit);

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Bookings ({bookings.total})
      </h2>
      {bookings.result.length === 0 ? (
        <p className="text-gray-600">This listing hasn't been booked yet.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.result.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
              >
                <Link to={`/user/${booking.tenant.id}`}>
                  <img
                    src={booking.tenant.avatar}
                    alt={booking.tenant.name}
                    className="h-10 w-10 rounded-full"
                  />
                </Link>
                <div className="text-sm">
                  <Link
                    to={`/user/${booking.tenant.id}`}
                    className="font-semibold text-gray-800 hover:underline"
                  >
                    {booking.tenant.name}
                  </Link>
                  <p className="text-gray-600">
                    {formatDate(booking.checkIn)} –{" "}
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
