import { listings } from "../listing";

export const resolvers = {
  Query: {
    listings: () => listings,
  },
  Mutation: {
    deleteListing: (_root: undefined, { id }: { id: string }) => {
      const indexToDelete = listings.findIndex((listing) => listing.id === id);

      if (indexToDelete !== -1) {
        return listings.splice(indexToDelete, 1)[0];
      }
      return null;
    },
  },
};
