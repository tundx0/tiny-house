require("dotenv").config();

import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";

const app = express();
const port = process.env.PORT;
const ser = async (app: Application) => {
  const db = await connectDatabase();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ db }),
  });
  await server.start();
  app.use(server.getMiddleware({ path: "/api" }) as Application);
  app.listen(port);

  console.log(`[app running on]: http://localhost:${port}`);
};

ser(app);
