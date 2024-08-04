import { Google } from "../../../lib/api";
import { Database, User, Viewer } from "../../../lib/types";
import { LogInArgs } from "./types";
import crypto from "crypto";

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  try {
    const { user } = await Google.logIn(code);
    if (!user) {
      throw new Error("Google login error");
    }

    const userNamesList = user.names && user.names.length ? user.names : null;
    const userPhotosList =
      user.photos && user.photos.length ? user.photos : null;
    const userEmailsList =
      user.emailAddresses && user.emailAddresses.length
        ? user.emailAddresses
        : null;

    const userName = userNamesList ? userNamesList[0].displayName : null;
    const userId = userNamesList?.[0]?.metadata?.source?.id ?? null;
    const userAvatar = userPhotosList ? userPhotosList[0].url : null;
    const userEmail = userEmailsList ? userEmailsList[0].value : null;

    if (!userId || !userName || !userAvatar || !userEmail) {
      throw new Error("Google Login Error: Missing necessary user information");
    }

    const updateRes = await db.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          name: userName,
          avatar: userAvatar,
          email: userEmail,
          token,
        },
        $setOnInsert: {
          income: 0,
          bookings: [],
          listings: [],
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return updateRes as User;
  } catch (error) {
    console.error("Error logging in via Google:", error);
    throw new Error("Failed to log in via Google");
  }
};

export const viewerResolvers = {
  Query: {
    authUrl: () => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`Failed to query google auth url: ${error}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      try {
        const code = input ? input?.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer = code ? await logInViaGoogle(code, token, db) : undefined;
        if (!viewer) {
          return { didRequest: true };
        }
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`Failed to login: ${error}`);
      }
    },
    logOut: () => {
      try {
        return { didRequest: true };
      } catch (error) {
        throw new Error(`Log out Failure: ${error}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id,
    hasWallet: (viewer: Viewer) => (viewer.walletId ? true : false),
  },
};
