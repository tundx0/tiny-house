import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { USER } from "../../queries";
import { UserQuery } from "src/__generated__/graphql";
import { ProfileCard } from "@/components";
import { ListingCard } from "../Listings/ListingCard";
import { Pagination } from "../common/Pagination";
import { useViewer } from "@/contexts/ViewerContext";

const ITEMS_PER_PAGE = 4;

const User: React.FC = () => {
  const { id } = useParams();
  const [bookingsPage, setBookingsPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const { viewer } = useViewer();

  const { data, loading, error } = useQuery<UserQuery>(USER, {
    variables: { id, bookingsPage, listingsPage, limit: ITEMS_PER_PAGE },
    skip: !viewer.id,
  });

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  const user = data?.user;

  if (!user)
    return <div className="text-center text-gray-600">User not found</div>;

  const bookingsTotalPages = Math.ceil(
    (user.bookings?.total || 1) / ITEMS_PER_PAGE
  );
  const listingsTotalPages = Math.ceil(
    (user.listings?.total || 1) / ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProfileCard user={user} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
        {user.bookings?.result && user.bookings.result.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {user.bookings.result.map((booking) => (
                <ListingCard key={booking.id} listing={booking.listing} />
              ))}
            </div>
            {bookingsTotalPages > 1 && (
              <Pagination
                currentPage={bookingsPage}
                totalPages={bookingsTotalPages}
                onPageChange={(page) => setBookingsPage(page)}
              />
            )}
          </>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Listings</h2>
        {user.listings?.result && user.listings.result.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {user.listings.result.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {listingsTotalPages > 1 && (
              <Pagination
                currentPage={listingsPage}
                totalPages={listingsTotalPages}
                onPageChange={(page) => setListingsPage(page)}
              />
            )}
          </>
        ) : (
          <p>No listings found.</p>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="bg-gray-200 h-32"></div>
    <div className="relative px-4 pb-4">
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
      </div>
      <div className="pt-16 text-center">
        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-2"></div>
      </div>
      <div className="mt-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded w-5/6 mx-auto"></div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ error: any }> = ({ error }) => (
  <div
    className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <strong className="font-bold">Error!</strong>
    <span className="block sm:inline"> {error.message}</span>
  </div>
);

export default User;
