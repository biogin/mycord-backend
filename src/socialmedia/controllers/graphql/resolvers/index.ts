import { FindConditions } from "typeorm";

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import { UserRepository } from "../../../application/repositories/userRepo";
import { PostRepository } from "../../../application/repositories/postRepo";
import { AuthService } from "../../../application/services/auth";
import { User } from "../../../domain/entities/User";
import { Profile } from "../../../domain/entities/Profile";
import { Post } from "../../../domain/entities/Post";
import { CommentRepository } from "../../../application/repositories/commentRepo";
import { NOT_AUTHENTICATED, USER_NOT_FOUND } from "../errors";
import { UseCase } from "../../../application/usecases";

interface Args {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: PostRepository;
  authService: AuthService;

  useCases: { [name: string]: UseCase<unknown, unknown> };
}

export function getResolvers({ userRepo, authService, postRepo, profileRepo, commentRepo, useCases }: Args) {
  return {
    Query: {
      user: async (_, { email }, { req }) => {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        return userRepo.findOne({ where: { profile: { email } } } as FindConditions<User>, { relations: ['posts'] });
      },
      post: async (_, { id }) => {
        return postRepo.findOne(id);
      },
      async posts(_, { userId }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        return postRepo.find({ relations: ['user'], where: { user: { id: userId } } });
      },
      loggedIn(_, _data, { req }): boolean {
        return req.session.isLoggedIn;
      }
    },
    Mutation: {
      signup: async (_, { name, password,  email, imageUrl, birthday }, { req, res }) => {
        if (req.session.isLoggedIn) {
          res.setHeader('Location', '/app');
          return res.end();
        }

        req.session.isLoggedIn = true;
        req.session.username = name;
        req.session.email = email;

        return authService.signup({ name, password, email, imageUrl, birthday });
      },
      login: async (_, { email, password }, { req, res }) => {
        if (req.session.isLoggedIn) {
          res.setHeader('Location', '/app');
          return res.end();
        }

        const profile = await authService.login({ email, password });

        req.session.isLoggedIn = true;
        req.session.username = profile.name;
        req.session.email = email;

        return profile;
      },
      async createPost(_, { title, description, audioUrl, userId }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        const user = await userRepo.findOne(userId, { relations: ['posts'] });

        if (!user) {
          throw new UserInputError(USER_NOT_FOUND);
        }

        const post = Post.create({ title, description, audioUrl, user });

        await postRepo.save(post);

        return post;
      },
      async likeEntity(_, { entityId, userId, likedEntityType }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        try {
          return await useCases.likeEntityUseCase.execute({ entityId, userId, likedEntityType });
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      async leaveComment(_, { postId, userId, comment }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        try {
          return await useCases.leaveCommentUseCase.execute({ postId, userId, comment });
        } catch (e) {
          console.error(e);

          throw e;
        }
      }
    }
  };
}
