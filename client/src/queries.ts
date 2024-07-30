import { gql } from "./__generated__/gql";

export const GET_ITEMS = gql(/* GraphQL */ `
  query GetItems {
    items {
      id
      name
      description
    }
  }
`);
