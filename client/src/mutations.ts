import { gql } from "./__generated__/gql";

export const LOG_IN = gql(/* GraphQL */ `
  mutation LogIn($input) {
    logIn(input: $input) {
    id,
    token
    avatar
    hasWallet
    didRequest
    }
  }
`);

export const LOG_OUT = gql(/* GraphQL */ `
  mutation LogOut {
    logOut {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`);
