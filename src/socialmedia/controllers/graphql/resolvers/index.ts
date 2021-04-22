import { EntityManager, In } from "typeorm";
import { PubSub } from 'apollo-server';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import nodemailer from 'nodemailer';

import { UserRepository } from "../../../application/repositories/userRepo";
import { FollowerRepository } from "../../../application/repositories/followerRepo";
import { PostRepository } from "../../../application/repositories/postRepo";
import { AuthService } from "../../../application/services/auth";
import { CommentRepository } from "../../../application/repositories/commentRepo";
import { ProfileRepository } from "../../../application/repositories/profileRepo";
import { UseCase } from "../../../application/usecases";

import { ALREADY_LOGGED_IN, INVALID_SESSION_DATA, NOT_AUTHENTICATED, USER_NOT_FOUND } from "../constants/errors";

import { Post } from "../../../domain/entities/Post";
import { Profile } from "../../../domain/entities/Profile";
import { User } from "../../../domain/entities/User";
import { MESSAGE_SENT } from "../constants/events";
import { ConversationRepository } from "../../../application/repositories/conversationRepo";
import { MessageRepository } from "../../../application/repositories/messageRepository";

interface Args {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: ProfileRepository;
  followerRepo: FollowerRepository;
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;

  authService: AuthService;

  getManager(): EntityManager;

  useCases: { [name: string]: UseCase<any, any> };
}

export function getResolvers({
                               userRepo,
                               authService,
                               postRepo,
                               profileRepo,
                               commentRepo,
                               useCases,
                               getManager,
                               followerRepo,
                               conversationRepo,
                               messageRepo
                             }: Args) {
  const pubsub = new PubSub();

  return {
    Query: {
      async user(_, { username }, { session }): Promise<{ user: User; me: boolean; isFollowing: boolean }> {
        const profile = await profileRepo.findOne({ where: { username }, relations: ['user'] });

        if (!profile) {
          throw new UserInputError(USER_NOT_FOUND);
        }

        profile.user.posts = await postRepo.find({
          take: 100,
          where: { user: { id: profile.user.id } },
          relations: ['user']
        });

        profile.user.profile = profile;

        const me = session.username === username;

        const isFollowingRequestedUser = session.isLoggedIn && !!(await followerRepo.findOne({
          where: {
            followedId: profile.user.id,
            followerId: session._userid
          }
        }));

        return {
          user: profile.user,
          me,
          isFollowing: isFollowingRequestedUser
        };
      },
      async userExists(_, { username }) {
        return !!(await profileRepo.findOne({ where: { username }, relations: ['user'] }));
      },
      async recentPosts(_, {}, { session }) {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        const postUserIds = (await followerRepo.find({ where: { followerId: session._userid } })).map(_ => _.followedId);

        return await postRepo.find(
            {
              order: { createdAt: 'ASC' },
              where: { 'user.id': In(postUserIds) },
              take: 100,
              relations: ['user']
            });
      },
      post: async (_, { id }, { session }) => {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        return postRepo.findOne(id);
      },
      async posts(_, { userId }, { session }) {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        if (!session._userid) {
          throw new AuthenticationError(INVALID_SESSION_DATA);
        }

        return postRepo.find({ relations: ['user'], where: { user: { id: session._userid } } });
      },
      async loggedInUser(_, {}, { session, req }): Promise<Profile> {
        if (!session.isLoggedIn || !session.email) {
          return null;
        }

        const profile = await profileRepo.findOne({ relations: ['user'], where: { email: session.email } });

        return profile || null;
      },
      async conversations(_, { conversationIds }, { session }) {
        if (!session.isLoggedIn || !session._userid) {
          return null;
        }

        const conversations = await conversationRepo.find({
          where: [{ userOne: session._userid }, { userTwo: session._userid }],
          relations: ['messages']
        });

        const receiversUserIds = conversations.map(({
                                                      userOne,
                                                      userTwo
                                                    }) => session._userid === userOne ? userTwo : userOne);

        const receiversProfiles = await userRepo.find({ where: { id: In(receiversUserIds) }, relations: ['profile'] });

        const receiversMap = new Map(receiversProfiles.map(_ => [_.id, _]));

        return Promise.all(conversations.map(async conversation => {
              conversation.messages.sort((a, b) => {
                const aCreatedAt = new Date(+a.createdAt)
                const bCreatedAt = new Date(+b.createdAt);

                if (aCreatedAt < bCreatedAt) {
                  return 1;
                }

                if (aCreatedAt > bCreatedAt) {
                  return -1;
                }

                return 0;
              });

              const user = (receiversMap.get(conversation.userOne) || receiversMap.get(conversation.userTwo));

              const [lastMessage] = conversation.messages.slice(0, 1);

              const profile = (await userRepo.findOne({ where: { id: lastMessage.senderId }, relations: ['profile'] }))?.profile;

              return {
                status: conversation.status,
                receivingUser: user,
                id: conversation.id,
                messages: [{
                  text: lastMessage.text,
                  authorProfile: profile
                }]
              }
            })
        );
      },
      async conversation(_, { id }, { session }) {
        if (!session.isLoggedIn || !session._userid) {
          return null;
        }

        const conversation = await conversationRepo.findOne({
          where: { id },
          relations: ['messages']
        });

        const messages = await Promise.all(conversation.messages.map(async message => {
          const user = await userRepo.findOne({ where: { id: message.senderId }, relations: ['profile'] });

          return {
            authorProfile: user.profile,
            text: message.text
          }
        }));

        return {
          id: conversation.id,
          messages,
          status: conversation.status
        }
      }
    },

    Subscription: {
      messageSent: {
        subscribe: () => pubsub.asyncIterator([MESSAGE_SENT])
      }
    },

    Mutation: {
      signup: async (_, { username, password, email, imageUrl, birthday }, { session }) => {
        if (session.isLoggedIn) {
          // should not happen but... shit happens
          session.destroy();

          throw new UserInputError('Already logged int', { message: ALREADY_LOGGED_IN });
        }

        const user = await authService.signup({ username, password, email, imageUrl, birthday });

        session.isLoggedIn = true;
        session.username = username;
        session._userid = user.id;
        session.email = email;

        return user;
      },
      login: async (_, { email, password }, { session }) => {
        if (session.isLoggedIn) {
          // should not happen but... shit happens
          session.destroy();

          throw new UserInputError('Already logged int', { message: ALREADY_LOGGED_IN });
        }

        const user = await authService.login({ email, password });

        session.isLoggedIn = true;
        session.username = user.profile.username;
        session._userid = user.id;
        session.email = email;

        return user;
      },
      signout(_, {}, { session }): Promise<Profile> {
        if (session.isLoggedIn) {
          const email = session.email;
          session.destroy();

          session = null;

          return profileRepo.findOne({ where: { email } });
        }
      },

      async sendMessage(_, { receiverId, text }, { session }): Promise<{ text: string; authorProfile: Profile }> {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        const authorProfile = await useCases.sendMessageUseCase.execute({
          receiverId,
          senderId: session._userid,
          text
        });

        pubsub.publish(MESSAGE_SENT, {
          messageSent: {
            text,
            authorProfile
          }
        });

        return {
          authorProfile,
          text
        };
      },
      async sendEmailVerification(_, { email }, { session }): Promise<void> {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        let transporter = nodemailer.createTransport()

      },
      async createPost(_, { title, description, audioUrl, userId }, { session }) {
        if (!session.isLoggedIn) {
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
      async likeEntity(_, { entityId, userId, likedEntityType }, { session }) {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        try {
          return await useCases.likeEntityUseCase.execute({ entityId, userId, likedEntityType });
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      async leaveComment(_, { postId, userId, comment }, { session }) {
        if (!session.isLoggedIn) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        try {
          return await useCases.leaveCommentUseCase.execute({ postId, userId, comment });
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      async follow(_, { username }, { session }) {
        if (!session.isLoggedIn || !session._userid) {
          throw new AuthenticationError(NOT_AUTHENTICATED);
        }

        try {
          return await useCases.followUserUseCase.execute({ username, followerId: session._userid });
        } catch (e) {
          console.error(e);

          throw e;
        }
      }
    }
  };
}
