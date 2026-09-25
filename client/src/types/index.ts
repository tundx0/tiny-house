export type Listing = {
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
};

export interface ListingCardProps {
  listing: Listing;
  booking?: { checkIn: string; checkOut: string };
}

export interface Viewer {
  id?: string | null;
  token?: string | null;
  avatar?: string | null;
  hasWallet?: boolean | null;
  didRequest: boolean;
}

export interface SvgProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  fill?: string;
}
