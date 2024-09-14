import { gql } from "./__generated__/gql";

export const AUTH_URL = gql(/* GraphQL */ `
  query AuthUrl {
    authUrl
  }
`);

export const USER = gql(/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      avatar
      email
      hasWallet
      income
    }
  }
`);
