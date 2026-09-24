import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { LISTINGS } from "@/queries";
import { ListingsFilter } from "@/__generated__/graphql";
import { ListingCard } from "./ListingCard";
import { Pagination } from "../common/Pagination";
import { ErrorBanner, ListingGridSkeleton } from "../common/Feedback";

const PAGE_LIMIT = 8;

const Listings: React.FC = () => {
  const { location } = useParams();
  const [filter, setFilter] = useState<ListingsFilter>(
    ListingsFilter.PriceLowToHigh,
  );
  const [page, setPage] = useState(1);

  // A new search starts back on the first page.
  useEffect(() => {
    setPage(1);
  }, [location, filter]);

  const { data, loading, error } = useQuery(LISTINGS, {
    variables: { location, filter, limit: PAGE_LIMIT, page },
  });

  const listings = data?.listings;
  const totalPages = listings ? Math.ceil(listings.total / PAGE_LIMIT) : 0;
  const heading = listings?.region
    ? `Results for "${listings.region}"`
    : location
      ? `Results for "${location}"`
      : "All listings";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
          {listings && (
            <p className="text-gray-600 mt-1">
              {listings.total} {listings.total === 1 ? "stay" : "stays"}{" "}
              available
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-gray-700">
          <span className="text-sm">Sort by</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ListingsFilter)}
            className="border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value={ListingsFilter.PriceLowToHigh}>
              Price: Low to High
            </option>
            <option value={ListingsFilter.PriceHighToLow}>
              Price: High to Low
            </option>
          </select>
        </label>
      </div>

      {error ? (
        <ErrorBanner message="We either couldn't find anything matching your search or have encountered an error. Please try searching again." />
      ) : loading && !listings ? (
        <ListingGridSkeleton count={PAGE_LIMIT} />
      ) : listings && listings.result.length > 0 ? (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${
              loading ? "opacity-60" : ""
            }`}
          >
            {listings.result.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-700">
            It appears that no listings have yet been created for{" "}
            <strong>{location ?? "this area"}</strong>.
          </p>
          <p className="text-gray-600 mt-2">
            Be the first person to{" "}
            <Link to="/host" className="text-blue-600 hover:underline">
              create a listing in this area
            </Link>
            !
          </p>
        </div>
      )}
    </div>
  );
};

export default Listings;
