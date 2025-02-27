import { Request } from "express";
import { Database, User } from "../types";

export const authorize = async (
  db: Database,
  req: Request
): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  const viewer = await db.users.findOne({
    token,
  });
  return viewer;
};
