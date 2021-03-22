import "reflect-metadata";
require('dotenv').config({
  path: __dirname + '/.env'
});
const { ApolloServer } = require('apollo-server-express');

import { Database } from "./infra/postgres";
import { App } from "./app";
import { typeDefs } from "./socialmedia/controllers/graphql";

const corsOptions = {
  origin: [process.env.ORIGIN, process.env.FRONTEND_ORIGIN],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
};

(async () => {
  try {
    const database = new Database();

    await database.init();

    const app = new App({ database });

    const server = new ApolloServer({
      typeDefs,
      resolvers: app.resolvers,
      playground: process.env.NODE_ENV === 'production' ? false : { settings: { 'request.credentials': 'include' } },
      context({ req, res }) {
        return {
          req,
          res,
          session: req.session
        }
      }
    });

    server.applyMiddleware({
      app: app.expressApp,
      cors: corsOptions
    });

    app.expressApp.listen({ port: 4000 }, () => {
      console.log(`Listen ${server.graphqlPath}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
