import { MongoClient } from "mongodb";
import { Booking, Database, Listing, User } from "../lib/types";

const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const cluster = process.env.DB_CLUSTER;

const url = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await new MongoClient(url);
  const db = client.db("main");

  return {
    bookings: db.collection<Booking>("bookings"),
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users"),
  };
};
