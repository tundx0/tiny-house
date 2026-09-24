import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { ListingCardProps } from "@/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  booking,
}) => {
  const { id, address, image, numOfGuests, price, title } = listing;
  return (
    <Link
      to={`/listing/${id}`}
      className="group block rounded-lg overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"
    >
      <div className="overflow-hidden">
        <img
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          src={image}
          alt={title}
          loading="lazy"
        />
      </div>
      <div className="px-4 py-4">
        <p className="text-gray-900 font-bold text-lg">
          {formatPrice(price)}
          <span className="text-sm font-normal text-gray-500"> / night</span>
        </p>
        <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2">
          {title}
        </h3>
        <p className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          <span className="truncate">{address}</span>
        </p>
        <p className="flex items-center text-gray-600 text-sm mt-2">
          <Users className="h-4 w-4 mr-1" />
          {numOfGuests} guests
        </p>
        {booking && (
          <p className="flex items-center text-blue-600 text-sm mt-2">
            <CalendarDays className="h-4 w-4 mr-1" />
            {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
          </p>
        )}
      </div>
    </Link>
  );
};
