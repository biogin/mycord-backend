import { EntityManager } from "typeorm";

import { UseCase } from "./index";
import { ConversationRepository } from "../repositories/conversationRepo";
import { MessageRepository } from "../repositories/messageRepository";
import { ProfileRepository } from "../repositories/profileRepo";

import { Message } from "../../domain/entities/Message";
import { Conversation } from "../../domain/entities/Conversation";
import { UserInputError } from "apollo-server-express";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { Profile } from "../../domain/entities/Profile";
import { UserRepository } from "../repositories/userRepo";

interface Deps {
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;
  profileRepo: ProfileRepository;
  userRepo: UserRepository;

  getTransactionManager(): EntityManager;
}

interface SendMessageRequestDTO {
  text: string;
  receiverId: number;
  senderId: number;
}

export class SendMessageUseCase implements UseCase<SendMessageRequestDTO, Promise<Profile>> {
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;
  profileRepo: ProfileRepository;
  userRepo: UserRepository;

  // getTransactionManager: () => EntityManager;

  constructor({ getTransactionManager, messageRepo, conversationRepo, profileRepo, userRepo }: Deps) {
    this.conversationRepo = conversationRepo;
    this.messageRepo = messageRepo;
    this.profileRepo = profileRepo;
    this.userRepo = userRepo;
    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ text, receiverId, senderId }: SendMessageRequestDTO): Promise<Profile> {
    let conversation = await this.conversationRepo.findOne({
      where: [
        {
          userOne: senderId,
          userTwo: receiverId
        },
        {
          userOne: receiverId,
          userTwo: senderId
        }
      ]
    });

    const user = await this.userRepo.findOne({ where: { id: senderId }, relations: ['profile'] });

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User with id=${senderId} doesn't exist` });
    }

    if (!conversation) {
      conversation = new Conversation();

      conversation.userTwo = senderId;
      conversation.userOne = receiverId;

      await this.conversationRepo.save(conversation);
    }

    const message = Message.create({ text, receiverId, senderId, conversation });

    await this.messageRepo.save(message);

    return user.profile;
  }
}
