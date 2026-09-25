import { gql } from "./__generated__/gql";

export const LOG_IN = gql(/* GraphQL */ `
  mutation LogIn($input: LogInInput) {
    logIn(input: $input) {
      id
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

export const CONNECT_STRIPE = gql(/* GraphQL */ `
  mutation ConnectStripe($input: ConnectStripeInput!) {
    connectStripe(input: $input) {
      hasWallet
    }
  }
`);

export const DISCONNECT_STRIPE = gql(/* GraphQL */ `
  mutation DisconnectStripe {
    disconnectStripe {
      hasWallet
    }
  }
`);

export const HOST_LISTING = gql(/* GraphQL */ `
  mutation HostListing($input: HostListingInput!) {
    hostListing(input: $input) {
      id
    }
  }
`);

export const CREATE_BOOKING = gql(/* GraphQL */ `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
    }
  }
`);
