import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} from "graphql";
import { listings } from "./listing";

const Listing = new GraphQLObjectType({
  name: "Listing",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    image: { type: GraphQLString },
    address: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    numOfGuests: { type: new GraphQLNonNull(GraphQLInt) },
    numOfBeds: { type: new GraphQLNonNull(GraphQLInt) },
    numOfBaths: { type: new GraphQLNonNull(GraphQLInt) },
    rating: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const query = new GraphQLObjectType({
  name: "Query",
  fields: {
    listings: {
      type: new GraphQLList(new GraphQLNonNull(Listing)),
      resolve: () => listings,
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    deleteListing: {
      type: Listing,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_root, { id }) => {
        const indexToDelete = listings.findIndex(
          (listing) => listing.id === id
        );

        if (indexToDelete !== -1) {
          // Remove the listing at the found index and return it
          return listings.splice(indexToDelete, 1)[0];
        }

        // Return null if the listing with the given id was not found
        return null;
      },
    },
  },
});

export const schema = new GraphQLSchema({ query, mutation });
