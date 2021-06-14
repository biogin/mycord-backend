import "reflect-metadata";
import http from 'http';

import { Database } from "./infra/postgres";
import { App } from "./app";
import { typeDefs } from "./socialmedia/controllers/graphql";
import { AuthenticationError, makeExecutableSchema } from "apollo-server-express";

require('dotenv').config({
  path: __dirname + '/.env'
});
const { ApolloServer } = require('apollo-server-express');

const corsOptions = {
  origin: [process.env.ORIGIN, process.env.FRONTEND_ORIGIN],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
};

;(async () => {
  try {
    const database = new Database();

    await database.init();

    const app = new App({ database });

    const schema = makeExecutableSchema({
      resolvers: app.resolvers,
      typeDefs
    });

    const server = new ApolloServer({
      schema,
      playground: process.env.NODE_ENV === 'production' ? false : { settings: { 'request.credentials': 'include' } },
      subscriptions: {
        path: '/subscriptions',
        onConnect(_, ws: any, { request }) {
          const res = {};

          return new Promise((res, rej) => {
            app.session(ws.upgradeReq, res, () => {
              if (!ws.upgradeReq.session?.isLoggedIn) {
                return rej(new AuthenticationError('Unauthorized'));
              }

              return res({ req: ws.upgradeReq, res, session: ws.upgradeReq.session });
            });
          });
        },
        onDisconnect() {
          console.log('client disconnect');
        }
      },
      context({ req, res, connection }) {
        return {
          req,
          res,
          session: req?.session,
          connection
        }
      }
    });

    server.applyMiddleware({
      app: app.expressApp,
      cors: corsOptions
    });

    const httpServer = http.createServer(app.expressApp);

    server.installSubscriptionHandlers(httpServer);

    const port = process.env.PORT || 4000;

    await new Promise(resolve => httpServer.listen(port, resolve));

    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);

  } catch (e) {
    console.error(e);
  }
})();
