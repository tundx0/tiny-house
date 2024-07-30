import { gql } from "./__generated__/gql";

export const GET_LISTINGS = gql(/* GraphQL */ `
  query GetListings {
    listings {
      address
      id
      image
      numOfBaths
      numOfBeds
      numOfGuests
      price
      rating
      title
    }
  }
`);
