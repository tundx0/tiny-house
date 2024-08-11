require("dotenv").config();

import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";

const app = express();
const port = process.env.PORT;
const ser = async (app: Application) => {
  const db = await connectDatabase();

  app.use(cookieParser(process.env.SECRET));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res }),
  });
  await server.start();
  app.use(server.getMiddleware({ path: "/api" }) as Application);
  app.listen(port);

  console.log(`[app running on]: http://localhost:${port}`);
};

ser(app);
