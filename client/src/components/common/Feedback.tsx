import React from "react";

export const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded"
    role="alert"
  >
    {message}
  </div>
);

export const ListingCardSkeleton: React.FC = () => (
  <div className="rounded-lg overflow-hidden shadow-md bg-white animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

export const ListingGridSkeleton: React.FC<{ count?: number }> = ({
  count = 8,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </div>
);
