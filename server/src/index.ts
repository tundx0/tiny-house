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
  app.use(
    server.getMiddleware({
      path: "/api",
      // Listing images are sent as base64 strings.
      bodyParserConfig: { limit: "2mb" },
      cors: {
        credentials: true,
        origin: [
          "http://domain.com:5173",
          "http://localhost:5173",
          "https://studio.apollographql.com",
          ...(process.env.PUBLIC_URL ? [process.env.PUBLIC_URL] : []),
        ],
      },
    }) as Application
  );

  app.listen(port);

  console.log(`[app running on]: http://localhost:${port}`);
};

ser(app);
