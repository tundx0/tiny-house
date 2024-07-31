import { useQuery } from "@apollo/client";
import React from "react";
import { GET_LISTINGS } from "../../queries";
import ListingCard from "./ListingCard";

const Listings: React.FC = () => {
  const { data, loading } = useQuery(GET_LISTINGS);

  return (
    <div className="flex flex-row gap-5 m-8">
      {!loading
        ? data?.listings?.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        : "Loading..."}
    </div>
  );
};

export default Listings;
