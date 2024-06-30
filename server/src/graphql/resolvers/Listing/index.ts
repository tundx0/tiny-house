import { ObjectId } from "mongodb";
import { Database, Listing } from "../../../lib/types";

export const listingResolvers = {
  Query: {
    listings: async (
      _root: undefined,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing[]> => await db.listings.find({}).toArray(),
  },
  Mutation: {
    deleteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deletedItem = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!deletedItem) {
        throw new Error("");
      }
      return deletedItem;
    },
  },
  Listing: {
    id: (listing: Listing): string => listing._id.toString(),
  },
};
