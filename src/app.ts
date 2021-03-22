import express, { Express } from 'express';
import { getManager } from "typeorm";
import redis from 'redis';
import expressSession from 'express-session';

const RedisStore = require('connect-redis')(expressSession);

const redisClient = redis.createClient()

import { getApplicationUseCases } from "./socialmedia/application/usecases";
import { Database } from "./infra/postgres";
import { AuthService } from "./socialmedia/application/services/auth";
import { getResolvers } from "./socialmedia/controllers/graphql/resolvers";

interface Args {
  database: Database;
}

export class App {
  private db: Database;

  resolvers: object;
  expressApp: Express;

  constructor({ database }: Args) {
    this.expressApp = express();
    this.db = database;

    const { userRepo, postRepo, profileRepo, commentRepo, likeRepo } = this.db.repos;

    const useCases = getApplicationUseCases({ userRepo, likeRepo, postRepo, commentRepo, profileRepo, getTransactionManager: getManager });

    const authService = new AuthService({ userRepo, profileRepo });

    this.resolvers = getResolvers({ userRepo, authService, postRepo, profileRepo, commentRepo, useCases, getManager });

    this.expressApp.use(expressSession({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'cat',
      resave: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false
      },
      saveUninitialized: false,
    }));
  }
}
