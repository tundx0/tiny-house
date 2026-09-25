import React from "react";
import { Link } from "react-router-dom";
import { Home, MapPin, Users } from "lucide-react";
import { ListingQuery, ListingType } from "@/__generated__/graphql";

type ListingData = ListingQuery["listing"];

export const ListingDetails: React.FC<{ listing: ListingData }> = ({
  listing,
}) => {
  const { title, description, image, type, address, city, numOfGuests, host } =
    listing;

  return (
    <div>
      <img
        src={image}
        alt={title}
        className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
      />
      <div className="mt-6">
        <p className="flex items-center text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          <Link
            to={`/listings/${encodeURIComponent(city)}`}
            className="hover:underline"
          >
            {city}
          </Link>
          <span className="mx-2">·</span>
          <span className="truncate">{address}</span>
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{title}</h1>
      </div>

      <div className="flex items-center gap-4 py-6 border-b border-gray-200">
        <Link to={`/user/${host.id}`}>
          <img
            src={host.avatar}
            alt={host.name}
            className="h-14 w-14 rounded-full"
          />
        </Link>
        <div>
          <p className="text-sm text-gray-500">Hosted by</p>
          <Link
            to={`/user/${host.id}`}
            className="text-lg font-semibold text-gray-800 hover:underline"
          >
            {host.name}
          </Link>
        </div>
      </div>

      <div className="py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          About this space
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm">
            <Home className="h-4 w-4 mr-1" />
            {type === ListingType.Apartment ? "Apartment" : "House"}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-sm">
            <Users className="h-4 w-4 mr-1" />
            {numOfGuests} guests
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
};
