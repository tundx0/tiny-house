require("dotenv").config();
import { connectDatabase } from "../src/database";

const clear = async () => {
  try {
    console.log("[clear]: running...");
    const db = await connectDatabase();

    await db.listings.drop();
    await db.users.drop();
    await db.bookings.drop();

    console.log("[clear]: success");
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw new Error("Failed to clear database");
  }
};

clear();
