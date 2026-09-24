import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Search } from "lucide-react";
import { LISTINGS } from "@/queries";
import { ListingsFilter } from "@/__generated__/graphql";
import { ListingCard } from "../Listings/ListingCard";
import { ListingGridSkeleton } from "../common/Feedback";
import mapBackground from "@/assets/map-background.jpg";
import toronto from "@/assets/toronto.jpg";
import dubai from "@/assets/dubai.jpg";
import losAngeles from "@/assets/los-angeles.jpg";
import london from "@/assets/london.jpg";
import sanFrancisco from "@/assets/san-fransisco.jpg";
import cancun from "@/assets/cancun.jpg";

const POPULAR_CITIES = [
  { name: "Toronto", image: toronto },
  { name: "Dubai", image: dubai },
  { name: "Los Angeles", image: losAngeles },
  { name: "London", image: london },
  { name: "San Francisco", image: sanFrancisco },
  { name: "Cancún", image: cancun },
];

const PREMIUM_LISTINGS_LIMIT = 4;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery(LISTINGS, {
    variables: {
      filter: ListingsFilter.PriceHighToLow,
      limit: PREMIUM_LISTINGS_LIMIT,
      page: 1,
    },
  });

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (value) {
      navigate(`/listings/${encodeURIComponent(value)}`);
    }
  };

  return (
    <div>
      <section
        className="bg-cover bg-center"
        style={{ backgroundImage: `url(${mapBackground})` }}
      >
        <div className="bg-white/70">
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Find a place you'll love to stay at
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Book unique homes and apartments from hosts around the world.
            </p>
            <form
              onSubmit={handleSearch}
              className="mt-8 mx-auto max-w-xl flex bg-white rounded-full shadow-lg overflow-hidden"
              role="search"
            >
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 'San Francisco'"
                aria-label="Search listings by location"
                className="flex-1 px-6 py-4 outline-none text-gray-800"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular cities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.name}
                to={`/listings/${encodeURIComponent(city.name)}`}
                className="group relative block rounded-lg overflow-hidden shadow-md h-40"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-semibold text-lg">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Premium listings
            </h2>
            <Link to="/listings" className="text-blue-600 hover:underline">
              View all listings
            </Link>
          </div>
          {loading ? (
            <ListingGridSkeleton count={PREMIUM_LISTINGS_LIMIT} />
          ) : error ? (
            <p className="text-gray-600">
              We couldn't load listings right now. Please try again later.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.listings.result.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-blue-600 text-white px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Have a place to share?</h2>
            <p className="mt-2 text-blue-100">
              Earn money by hosting your home or apartment on TinyHouse.
            </p>
          </div>
          <Link
            to="/host"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50"
          >
            Become a host
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
