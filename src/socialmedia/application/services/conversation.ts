import { ConversationRepository } from "../repositories/conversationRepo";
import { ConversationStatus } from "../../domain/entities/Conversation";
import { UserRepository } from "../repositories/userRepo";
import { Message } from "../../domain/entities/Message";
import { ConversationActivityRepository } from "../repositories/conversationActivityRepo";

interface Deps {
  conversationRepo: ConversationRepository;
  userRepo: UserRepository;
  conversationActivityRepo: ConversationActivityRepository;
}

export class ConversationService {
  conversationRepo: ConversationRepository;
  conversationActivityRepo: ConversationActivityRepository;
  userRepo: UserRepository;

  constructor({ conversationRepo, userRepo, conversationActivityRepo }: Deps) {
    this.conversationRepo = conversationRepo;
    this.userRepo = userRepo;
    this.conversationActivityRepo = conversationActivityRepo;
  }

  async getConversations({ userId }: { userId: number }): Promise<any> {
    const conversations = await this.conversationRepo.findUserConversations(userId, ['messages', 'activity']);

    const receiversUserIds = conversations.map(({
                                                  userOne,
                                                  userTwo
                                                }) => userId === userOne ? userTwo : userOne);

    const receiversProfiles = await this.userRepo.findUsers(receiversUserIds, ['profile']);

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

          const profile = (await this.userRepo.findById(lastMessage.senderId, ['profile']))?.profile;

          return {
            status: conversation.status,
            receivingUser: user,
            id: conversation.id,
            messages: [{
              text: lastMessage.text,
              authorProfile: profile
            }],
            unreadMessagesCount: user.id === conversation.activity.userId ? conversation.activity?.unreadMessages : 0
          }
        })
    );
  }

  async getConversation(id: number): Promise<{ messages: Array<Partial<Message>>; id: number; status: ConversationStatus }> {
    const conversation = await this.conversationRepo.findById(id, ['messages']);

    const messages = await Promise.all(conversation.messages.map(async message => {
      const user = await this.userRepo.findById(message.senderId, ['profile']);

      return {
        authorProfile: user.profile,
        text: message.text
      } as Partial<Message>;
    }));

    return {
      id: conversation.id,
      messages,
      status: conversation.status
    }
  }

  async setConversationStatus(id: number, newStatus: ConversationStatus): Promise<any> {
    await Promise.all([
      this.conversationRepo.updateConversationStatus(id, newStatus),
      newStatus === ConversationStatus.Default ? this.conversationActivityRepo.resetUnreadMessage(id) : void 0
    ]);
  }
}
