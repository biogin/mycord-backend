import "reflect-metadata";
import redis from 'redis';
import expressSession from 'express-session';
import { getManager } from 'typeorm';
import cors from 'cors';

require('dotenv').config({
  path: __dirname + '/env'
});
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const RedisStore = require('connect-redis')(expressSession);

const redisClient = redis.createClient()

import { getOrCreateConnection, getRepositories } from "./infra/postgres";

import { getResolvers } from "./socialmedia/controllers/graphql/resolvers";
import { typeDefs } from "./socialmedia/controllers/graphql";
import { AuthService } from "./socialmedia/application/services/auth";
import { getApplicationUseCases } from "./socialmedia/application/usecases";

const corsOptions = {
  // origin: corsConfig.corsWhitelist.split(','),
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
};

(async () => {
  try {
    const app = express();

    const connection = await getOrCreateConnection();

    // await connection.runMigrations();

    const { userRepo, postRepo, profileRepo, commentRepo, likeRepo } = getRepositories(connection);

    const useCases = getApplicationUseCases({ userRepo, likeRepo, postRepo, commentRepo, profileRepo, getTransactionManager: getManager });

    const authService = new AuthService({ userRepo, profileRepo });

    const resolvers = getResolvers({ userRepo, authService, postRepo, profileRepo, commentRepo, useCases });

    app.use(expressSession({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'cat',
      resave: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false
      },
      saveUninitialized: false,
    }));

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      playground: process.env.NODE_ENV === 'production' ? false : { settings: { 'request.credentials': 'include' } },
      context({ req }) {
        return {
          req,
          session: req.session
        }
      }
    });

    server.applyMiddleware({
      app,
      cors: corsOptions
    });

    app.listen({ port: 4000 }, () => {
      console.log(`Listen ${server.graphqlPath}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
