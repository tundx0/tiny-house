import { Request } from "express";
import { Filter, ObjectId } from "mongodb";
import { Cloudinary, geocode, parseAddress } from "../../../lib/api";
import {
  Database,
  Listing,
  ListingArgs,
  ListingType,
  User,
} from "../../../lib/types";
import { authorize, escapeRegex, paginate } from "../../../lib/utils";
import {
  HostListingArgs,
  HostListingInput,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
} from "./types";

const verifyHostListingInput = ({
  title,
  description,
  image,
  type,
  address,
  price,
  numOfGuests,
}: HostListingInput) => {
  if (!title.trim() || title.length > 100) {
    throw new Error("listing title must be between 1 and 100 characters");
  }
  if (!description.trim() || description.length > 5000) {
    throw new Error(
      "listing description must be between 1 and 5000 characters"
    );
  }
  if (!image.startsWith("data:image/")) {
    throw new Error("listing image must be a base64 encoded image");
  }
  if (!Object.values(ListingType).includes(type)) {
    throw new Error("listing type must be either an apartment or house");
  }
  if (!address.trim()) {
    throw new Error("listing address is required");
  }
  if (!Number.isInteger(price) || price <= 0) {
    throw new Error("price must be greater than 0");
  }
  if (!Number.isInteger(numOfGuests) || numOfGuests <= 0) {
    throw new Error("number of guests must be greater than 0");
  }
};

export const listingResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        if (!ObjectId.isValid(id)) {
          throw new Error("listing not found");
        }
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing not found");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        const query: Filter<Listing> = {};
        let region: string | null = null;

        if (location && location.trim()) {
          const geocoded = await geocode(location);

          if (geocoded?.country) {
            const { country, admin, city } = geocoded;
            query.country = country;
            if (admin) query.admin = admin;
            if (city) query.city = city;
            region = [city, admin, country].filter(Boolean).join(", ");
          } else {
            // No geocoding available (or no match): fall back to a loose
            // text match against the stored location fields.
            const pattern = new RegExp(escapeRegex(location.trim()), "i");
            query.$or = [
              { city: pattern },
              { admin: pattern },
              { country: pattern },
              { address: pattern },
            ];
            region = location.trim();
          }
        }

        const sort: Record<string, 1 | -1> =
          filter === ListingsFilter.PRICE_HIGH_TO_LOW
            ? { price: -1, _id: 1 }
            : { price: 1, _id: 1 };
        const { skip, limit: itemsPerPage } = paginate(limit, page);

        const [total, result] = await Promise.all([
          db.listings.countDocuments(query),
          db.listings
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .toArray(),
        ]);

        return { region, total, result };
      } catch (error) {
        throw new Error(`Failed to query listings: ${error}`);
      }
    },
  },
  Mutation: {
    hostListing: async (
      _root: undefined,
      { input }: HostListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      verifyHostListingInput(input);

      const viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("viewer cannot be found");
      }
      if (!viewer.walletId) {
        throw new Error("viewer must connect with Stripe to host a listing");
      }

      const location =
        (await geocode(input.address)) ?? parseAddress(input.address);
      if (!location.country || !location.admin || !location.city) {
        throw new Error("invalid address input");
      }

      const imageUrl = await Cloudinary.upload(input.image);

      const listing: Listing = {
        _id: new ObjectId(),
        ...input,
        title: input.title.trim(),
        description: input.description.trim(),
        address: input.address.trim(),
        image: imageUrl,
        country: location.country,
        admin: location.admin,
        city: location.city,
        host: viewer._id,
        bookings: [],
        bookingsIndex: {},
      };

      await db.listings.insertOne(listing);
      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: listing._id } }
      );

      return listing;
    },
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: Record<string, never>,
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("host can't be found");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex ?? {});
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }

        const { skip, limit: itemsPerPage } = paginate(limit, page);
        const query = { _id: { $in: listing.bookings } };

        const [total, result] = await Promise.all([
          db.bookings.countDocuments(query),
          db.bookings
            .find(query)
            .sort({ checkIn: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .toArray(),
        ]);

        return { total, result };
      } catch (error) {
        throw new Error(`Failed to query listing bookings: ${error}`);
      }
    },
  },
};
