import { Collection, ObjectId } from "mongodb";

export interface Listing {
  _id: ObjectId;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
  numOfBaths: number;
  numOfBeds: number;
  rating: number;
}

// Ensure mongo methods return the listing type from their result so typescript can recognize the type of information being returned from the database queries.

export interface Database {
  listings: Collection<Listing>;
}
