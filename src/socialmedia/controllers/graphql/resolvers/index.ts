import { FindConditions } from "typeorm";

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import { UserRepository } from "../../../application/repositories/userRepo";
import { PostRepository } from "../../../application/repositories/postRepo";
import { AuthService } from "../../../application/services/auth";
import { User } from "../../../domain/entities/User";
import { Profile } from "../../../domain/entities/Profile";
import { Post } from "../../../domain/entities/Post";

interface Args {
  userRepo: UserRepository;
  postRepo: PostRepository;
  profileRepo: PostRepository;
  authService: AuthService;
}

export function getResolvers({ userRepo, authService, postRepo, profileRepo }: Args) {
  return {
    Query: {
      user: async (_, { email }) => {
        const user = await userRepo.findOne({ where: { profile: { email } } } as FindConditions<User>, { relations: ['posts'] });

        console.log('requested user ', user);

        return user;
      },
      post: async (_, { id }) => {
        return postRepo.findOne(id);
      },
      async posts(_, { userId }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError('access_denied');
        }

        return postRepo.find({ relations: ['user'], where: { user: { id: userId } } });
      }
    },
    Mutation: {
      signup: async (_, { name, password, bio, email, imageUrl }, { req, res }) => {
        return authService.signup({ name, password, email, imageUrl });
      },
      createUser: async (_, { name, password }, context) => {
        const p = new Profile();

        p.email = 'igor@ramler.ru' + Math.random();
        p.imageUrl = 'image.png';
        p.name = name;
        p.password = password;

        await profileRepo.save(p);

        const u = new User();

        u.profile = p;
        u.comments = [];
        u.posts = [];

        await userRepo.save(u);

        return u;
      },
      login: async (_, { email, password }, { req }) => {
        const profile = await authService.login({ email, password });

        req.session.isLoggedIn = true;
        req.session.username = profile.name;
        req.session.email = email;

        return profile;
      },

      async createPost(_, { title, description, audioUrl, userId }, { req }) {
        if (!req.session.isLoggedIn) {
          throw new AuthenticationError('access_denied');
        }

        const user = await userRepo.findOne(userId, { relations: ['posts'] });
        console.log(user);

        if (!user) {
          throw new UserInputError('invalid_userid');
        }

        const post = Post.create({ title, description, audioUrl });

        await postRepo.save(post);

        return post;
      }
    }
  };
}
