import express from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./graphql";
import { GraphQLSchema } from "graphql";

const ser = async (schema: GraphQLSchema) => {
  const app = express();
  const port = 9000;

  const server = new ApolloServer({ schema });
  await server.start();
  app.use(server.getMiddleware({ path: "/api" }));
  app.listen(port);

  console.log(`[app running on]: http://localhost:${port}`);
};

ser(schema);
