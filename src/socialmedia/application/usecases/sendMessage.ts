import { EntityManager } from "typeorm";

import { ConversationRepository } from "../repositories/conversationRepo";
import { ProfileRepository } from "../repositories/profileRepo";

import { Message, MessageStatus } from "../../domain/entities/Message";
import { Conversation } from "../../domain/entities/Conversation";
import { UserInputError } from "apollo-server-express";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { UserRepository } from "../repositories/userRepo";
import { ConversationActivityRepository } from "../repositories/conversationActivityRepo";
import { Profile } from "../../domain/entities/Profile";
import { ConversationActivity } from "../../domain/entities/ConversationActivity";
import { UseCase } from "../interfaces/useCase";
import { MessageRepository } from "../repositories/messageRepo";

interface Deps {
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;
  profileRepo: ProfileRepository;
  userRepo: UserRepository;
  conversationActivityRepo: ConversationActivityRepository;

  getTransactionManager(): EntityManager;
}

interface SendMessageRequestDTO {
  text: string;
  receiverId: number;
  senderId: number;
  markAsRead: boolean;
}

type Result = {
  profile: Profile;
  unreadMessagesCount: number;
};

export class SendMessageUseCase implements UseCase<SendMessageRequestDTO, Promise<Result>> {
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;
  profileRepo: ProfileRepository;
  userRepo: UserRepository;
  conversationActivityRepo: ConversationActivityRepository;

  // getTransactionManager: () => EntityManager;

  constructor({
                getTransactionManager,
                messageRepo,
                conversationRepo,
                profileRepo,
                userRepo,
                conversationActivityRepo
              }: Deps) {
    this.conversationRepo = conversationRepo;
    this.messageRepo = messageRepo;
    this.profileRepo = profileRepo;
    this.userRepo = userRepo;
    this.conversationActivityRepo = conversationActivityRepo;
    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ text, receiverId, senderId, markAsRead }: SendMessageRequestDTO): Promise<Result> {
    let conversation = await this.conversationRepo.findByUserIds(senderId, receiverId, ['activity']);

    const user = await this.userRepo.findById(senderId, ['profile']);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User with id=${senderId} doesn't exist` });
    }

    if (!conversation) {
      conversation = new Conversation();

      conversation.userOne = receiverId;
      conversation.userTwo = senderId;

      await this.conversationRepo.save(conversation);

      const conversationActivity = ConversationActivity.create({ conversation, userId: receiverId });
      await this.conversationActivityRepo.save(conversationActivity);

      conversation.activity = conversationActivity;
    }

    const message = Message.create({
      text,
      receiverId,
      senderId,
      conversation,
      // move this into message model logic
      status: markAsRead ? MessageStatus.Read : MessageStatus.Unread
    });

    await this.messageRepo.save(message);

    if (markAsRead) {
      await this.conversationActivityRepo.update(conversation.activity.id, {
        unreadMessages: 0,
        userId: receiverId
      });
    } else {
      await this.conversationActivityRepo.incrementUnreadMessages(conversation.activity.id);
    }

    return {
      profile: user.profile,
      unreadMessagesCount: conversation.activity.userId === senderId ? 0 : conversation.activity.unreadMessages + 1
    };
  }
}
