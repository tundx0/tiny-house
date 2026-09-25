import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { CheckCircle } from "lucide-react";
import { LISTING } from "@/queries";
import { useViewer } from "@/contexts/ViewerContext";
import { ErrorBanner } from "../common/Feedback";
import { ListingDetails } from "./ListingDetails";
import { ListingBookings } from "./ListingBookings";
import { ListingCreateBooking } from "./ListingCreateBooking";
import { ListingCreateBookingModal } from "./ListingCreateBookingModal";

const BOOKINGS_LIMIT = 4;

const Listing: React.FC = () => {
  const { id } = useParams();
  const { viewer } = useViewer();
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  // Wait for the viewer so hosts get their listing's bookings.
  const { data, loading, error, refetch } = useQuery(LISTING, {
    variables: { id: id ?? "", bookingsPage, limit: BOOKINGS_LIMIT },
    skip: !id || !viewer.didRequest,
  });

  if (loading || !viewer.didRequest) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 md:h-96 bg-gray-200 rounded-lg" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mt-6" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorBanner message="This listing may not exist or we've encountered an error. Please try again soon." />
      </div>
    );
  }

  const listing = data.listing;

  const handleBooked = () => {
    setModalOpen(false);
    setBooked(true);
    setCheckIn("");
    setCheckOut("");
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {booked && (
        <div className="mb-6 flex items-center gap-2 rounded bg-green-50 border border-green-300 text-green-800 px-4 py-3">
          <CheckCircle className="h-5 w-5" />
          <span>
            You've successfully booked this listing! You can find your booking
            on your profile page.
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ListingDetails listing={listing} />
          {listing.bookings && (
            <ListingBookings
              bookings={listing.bookings}
              page={bookingsPage}
              limit={BOOKINGS_LIMIT}
              onPageChange={setBookingsPage}
            />
          )}
        </div>
        <div>
          <div className="lg:sticky lg:top-6">
            <ListingCreateBooking
              viewer={viewer}
              hostId={listing.host.id}
              hostHasWallet={listing.host.hasWallet}
              price={listing.price}
              bookingsIndex={listing.bookingsIndex}
              checkIn={checkIn}
              checkOut={checkOut}
              setCheckIn={setCheckIn}
              setCheckOut={setCheckOut}
              onRequestBooking={() => setModalOpen(true)}
            />
          </div>
        </div>
      </div>
      {modalOpen && (
        <ListingCreateBookingModal
          listingId={listing.id}
          price={listing.price}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setModalOpen(false)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
};

export default Listing;
