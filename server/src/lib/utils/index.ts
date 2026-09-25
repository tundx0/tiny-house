import { Request } from "express";
import { Database, User } from "../types";

export const authorize = async (
  db: Database,
  req: Request
): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  if (!token) {
    return null;
  }
  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token,
  });
  return viewer;
};

export const paginate = (limit: number, page: number) => {
  const itemsPerPage = limit > 0 ? Math.min(limit, 50) : 10;
  const currentPage = page > 0 ? page : 1;
  return { skip: (currentPage - 1) * itemsPerPage, limit: itemsPerPage };
};

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
