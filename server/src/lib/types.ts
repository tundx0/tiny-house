import { Collection, ObjectId } from "mongodb";

export interface Listing {
  _id: ObjectId;
}

// Ensure mongo methods return the listing type from their result so typescript can recognize the type of information being returned from the database queries.
export interface User {
  _id: ObjectId;
}

export interface Booking {
  _id: ObjectId;
}

export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
}
