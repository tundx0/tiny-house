import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";

const ser = async () => {
  const app = express();
  const port = 9000;

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use(server.getMiddleware({ path: "/api" }));
  app.listen(port);

  console.log(`[app running on]: http://localhost:${port}`);
};

ser();
