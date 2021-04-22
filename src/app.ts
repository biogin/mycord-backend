import express, { Express } from 'express';
import { getManager } from "typeorm";
import redis from 'redis';
import expressSession from 'express-session';

const RedisStore = require('connect-redis')(expressSession);
// const helmet = require('helmet');

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

  readonly resolvers: object;
  readonly session: any;
  readonly expressApp: Express;

  constructor({ database }: Args) {
    this.expressApp = express();
    this.db = database;

    const {
      userRepo,
      postRepo,
      profileRepo,
      commentRepo,
      likeRepo,
      followerRepo,
      messageRepo,
      conversationRepo,
    } = this.db.repos;

    const useCases = getApplicationUseCases({
      userRepo,
      likeRepo,
      postRepo,
      commentRepo,
      profileRepo,
      messageRepo,
      conversationRepo,
      followerRepo,
      getTransactionManager: getManager
    });

    const authService = new AuthService({ userRepo, profileRepo });

    this.resolvers = getResolvers({
      userRepo,
      authService,
      postRepo,
      followerRepo,
      profileRepo,
      commentRepo,
      useCases,
      conversationRepo,
      messageRepo,
      getManager
    });

    this.session = expressSession({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'cat',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      },
    });

    this.expressApp.use(this.session);

    // this.expressApp.use(helmet());
  }
}
