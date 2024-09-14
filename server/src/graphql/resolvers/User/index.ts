import { Request } from "express";
import { Database, User } from "../../../lib/types";
import {
  UserArgs,
  UserBookingsData,
  UserBookingsArgs,
  UserListingsArgs,
  UserListingsData,
} from "./types";
import { authorize } from "../../../lib/utils";

export const userResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });
        if (!user) {
          throw new Error("user not found!");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }

        return user as User;
      } catch (error) {
        throw new Error(`Failed to fetch user: ${error}`);
      }
    },
  },
  User: {
    id: (user: User) => {
      return user._id;
    },
    hasWallet: (user: User) => {
      return !!user.walletId;
    },
    income: (user: User) => {
      return user.authorized ? user.income : null;
    },
    bookings: async (
      user: User,
      { limit, page }: UserBookingsArgs,
      { db }: { db: Database }
    ): Promise<UserBookingsData | null> => {
      try {
        if (!user.authorized) {
          return null;
        }

        const itemsPerPage = limit > 0 ? limit : 10;
        const currentPage = page > 0 ? page : 1;
        const skipItems = (currentPage - 1) * itemsPerPage;

        const pipeline = [
          { $match: { _id: { $in: user.bookings } } },
          {
            $facet: {
              totalCount: [{ $count: "count" }],
              paginatedResults: [
                { $skip: skipItems },
                { $limit: itemsPerPage },
              ],
            },
          },
        ];

        const result = await db.bookings.aggregate(pipeline).toArray();

        const total = result[0]?.totalCount[0]?.count || 0;
        const bookings = result[0]?.paginatedResults || [];

        const data: UserBookingsData = {
          total,
          result: bookings,
        };

        return data;
      } catch (error) {
        throw new Error(`Failed to fetch user bookings: ${error}`);
      }
    },
    listings: async (
      user: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database }
    ): Promise<UserListingsData | null> => {
      try {
        if (!user.authorized) {
          return null;
        }

        const itemsPerPage = limit > 0 ? limit : 10;
        const currentPage = page > 0 ? page : 1;
        const skipItems = (currentPage - 1) * itemsPerPage;

        const pipeline = [
          { $match: { _id: { $in: user.listings } } },
          {
            $facet: {
              totalCount: [{ $count: "count" }],
              paginatedResults: [
                { $skip: skipItems },
                { $limit: itemsPerPage },
              ],
            },
          },
        ];

        const result = await db.listings.aggregate(pipeline).toArray();

        const total = result[0]?.totalCount[0]?.count || 0;
        const listings = result[0]?.paginatedResults || [];

        const data: UserListingsData = {
          total,
          result: listings,
        };

        return data;
      } catch (error) {
        throw new Error(`Failed to fetch user listings: ${error}`);
      }
    },
  },
};
