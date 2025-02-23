export type Listing = {
  address: string;
  id: string | number;
  image: string;
  numOfBaths?: number;
  numOfBeds?: number;
  numOfGuests: number;
  price: number;
  rating?: number;
  title: string;
};

export interface ListingCardProps {
  listing: Listing;
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
