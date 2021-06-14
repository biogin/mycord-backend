import { EntityManager } from "typeorm";
import { PubSub } from 'apollo-server';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import nodemailer from 'nodemailer';

import { UserRepository } from "../../../application/repositories/userRepo";
import { FollowerRepository } from "../../../application/repositories/followerRepo";
import { PostRepository } from "../../../application/repositories/postRepo";
import { AuthService } from "../../../application/services/auth";
import { CommentRepository } from "../../../application/repositories/commentRepo";
import { ProfileRepository } from "../../../application/repositories/profileRepo";

import { ALREADY_LOGGED_IN, INVALID_SESSION_DATA, NOT_AUTHENTICATED, USER_NOT_FOUND } from "../constants/errors";

import { Profile } from "../../../domain/entities/Profile";
import { User } from "../../../domain/entities/User";
import { MESSAGE_SENT, USER_TYPING } from "../constants/events";
import { ConversationRepository } from "../../../application/repositories/conversationRepo";
import { PostService } from "../../../application/services/post";
import { ConversationActivityRepository } from "../../../application/repositories/conversationActivityRepo";
import { ConversationService } from "../../../application/services/conversation";
import { ApplicationUseCases } from "../../../application/usecases";
import { MessageRepository } from "../../../application/repositories/messageRepo";
import { Nullable } from "../../../../@types/ts";

const posts = new Array(25).fill(0).map(() => ({
  id: 1,
  title: 'Super title',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  // createdAt: new Date(),
  profile: {
    username: 'Igor',
    imageUrl: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-4.png'
  },
  comments: [
    {
      text: 'Looks good!',
      profile: {
        username: 'Igor duplicate',
        imageUrl: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-4.png'
      }
    }
  ]
}));

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: ProfileRepository;
  followerRepo: FollowerRepository;
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;
  conversationActivityRepo: ConversationActivityRepository;

  authService: AuthService;
  postService: PostService;
  conversationService: ConversationService;

  getManager(): EntityManager;

  useCases: ApplicationUseCases;
}

function ensureIsLoggedIn(session: any) {
  if (!session.isLoggedIn || !session.user._id) {
    session.destroy();

    throw new AuthenticationError(NOT_AUTHENTICATED);
  }
}

export function getResolvers({
                               authService,
                               conversationService,
                               postService,

                               useCases,

                               userRepo,
                               postRepo,
                               profileRepo,
                               followerRepo,
                               conversationRepo,
                               conversationActivityRepo
                             }: Deps) {
  const pubsub = new PubSub();

  return {
    Query: {
      async user(_, { username }, { session }): Promise<{ user: User; me: boolean; isFollowing: boolean }> {
        const profile = await profileRepo.findOneByUsername(username, ['user']);

        if (!profile) {
          throw new UserInputError(USER_NOT_FOUND);
        }

        profile.user.posts = await postRepo.findUserPosts(profile.user.id);

        profile.user.profile = profile;

        const me = session.user.name === username;

        const isFollowingRequestedUser = session.isLoggedIn && await followerRepo.followerExists(profile.user.id, session._userid);

        return {
          user: profile.user,
          me,
          isFollowing: isFollowingRequestedUser
        };
      },
      async userExists(_, { username }) {
        return !!(await profileRepo.findOneByUsername(username));
      },
      async recentPosts(_, {}, { session }) {
        ensureIsLoggedIn(session);

        const posts = await postService.getRecentPosts(session.user._id);

        return posts;
      },
      post: async (_, { id }, { session }) => {
        ensureIsLoggedIn(session);

        return postRepo.findOnyById(id);
      },
      async posts(_, { userId }, { session }) {
        ensureIsLoggedIn(session);

        if (!session.user._id) {
          throw new AuthenticationError(INVALID_SESSION_DATA);
        }

        return postRepo.findUserPosts(session.user._id);
      },
      async loggedInUser(_, {}, { session }): Promise<Nullable<Profile>> {
        return await profileRepo.findOneByEmail(session.user.email);
      },
      async conversations(_, { conversationIds }, { session }) {
        ensureIsLoggedIn(session);

        return conversationService.getConversations({ userId: session.user._id });
      },
      async conversation(_, { id }, { session }) {
        ensureIsLoggedIn(session);

        return conversationService.getConversation(id);
      },
      async conversationByUsersIds(_, { userOne, userTwo }, { session }) {
        ensureIsLoggedIn(session);

        return await conversationRepo.findByUserIds(userOne, userTwo);
      },
    },
    Subscription: {
      messageSent: {
        subscribe: () => pubsub.asyncIterator([MESSAGE_SENT])
      },
      userTyping: {
        subscribe: () => pubsub.asyncIterator([USER_TYPING])
      }
    },
    Mutation: {
      async setConversationStatus(_, { id, status }, { session }) {
        ensureIsLoggedIn(session);

        return conversationService.setConversationStatus(id, status);
      },
      signup: async (_, { username, password, email, imageUrl, birthday }, { session }) => {
        if (session.isLoggedIn) {
          // should not happen but... shit happens
          session.destroy();

          throw new UserInputError('Already logged int', { message: ALREADY_LOGGED_IN });
        }

        const user = await authService.signup({ username, password, email, imageUrl, birthday });

        session.isLoggedIn = true;
        session.user = {
          _id: user.id,
          name: username,
          image: user.profile.imageUrl,
          email
        };

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
        session.user = {
          _id: user.id,
          name: user.profile.username,
          image: user.profile.imageUrl,
          email
        };

        return user;
      },
      signout(_, {}, { session }): Promise<Profile> {
        if (session.isLoggedIn) {
          const email = session.user.email;
          session.destroy();

          session = null;

          return profileRepo.findOneByEmail(email);
        }

        return null
      },

      async sendMessage(_, {
        receiverId,
        text,
        currentConversationId,
        markAsRead
      }, { session }): Promise<number> {
        ensureIsLoggedIn(session);

        const { unreadMessagesCount, profile } = await useCases.sendMessageUseCase.execute({
          receiverId,
          senderId: session.user._id,
          text,
          markAsRead
        });

        pubsub.publish(MESSAGE_SENT, {
          messageSent: {
            text,
            authorProfile: profile,
            currentConversationId
          }
        });

        return unreadMessagesCount;
      },
      async sendEmailVerification(_, { email }, { session }): Promise<void> {
        ensureIsLoggedIn(session);

        let transporter = nodemailer.createTransport()

      },
      async createPost(_, { title, audioUrl }, { session }) {
        ensureIsLoggedIn(session);

        try {
          return await useCases.createPostUseCase.execute({ title, audioUrl, authorId: session.user._id });
        } catch (e) {
          console.error('Error createPost', e);

          return null;
        }
      },
      async likeEntity(_, { entityId, userId, likedEntityType }, { session }) {
        ensureIsLoggedIn(session);

        try {
          return await useCases.likeEntityUseCase.execute({ entityId, userId, likedEntityType });
        } catch (e) {
          // TODO do not rethrow
          console.error(e);

          throw e;
        }
      },
      async leaveComment(_, { postId, userId, comment }, { session }) {
        ensureIsLoggedIn(session);

        try {
          return await useCases.leaveCommentUseCase.execute({ postId, userId, text: comment });
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      async follow(_, { username }, { session }) {
        ensureIsLoggedIn(session);

        try {
          return await useCases.followUserUseCase.execute({ username, followerId: session.user._id });
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      async editProfile(_, { imageUrl }, { session }) {
        ensureIsLoggedIn(session);

        const { affected } = await profileRepo.updateProfile(session.user.name, { imageUrl });

        session.user.image = imageUrl;

        return affected > 0;
      }
    },
  };
}
