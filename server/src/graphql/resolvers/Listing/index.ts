import { ObjectId } from "mongodb";
import { Database, LisitingArgs, Listing } from "../../../lib/types";

export const listingResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: LisitingArgs,
      { db }: { db: Database }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing not found");
        }
        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
  },
};
