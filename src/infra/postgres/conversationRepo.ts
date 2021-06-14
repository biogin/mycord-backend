import { EntityManager, EntityRepository } from "typeorm";

import { ConversationRepository as IConversationRepository } from "../../socialmedia/application/repositories/conversationRepo";
import { Conversation, ConversationStatus } from "../../socialmedia/domain/entities/Conversation";
import { Nullable } from "../../@types/ts";

@EntityRepository(Conversation)
export class ConversationRepository implements IConversationRepository {
  constructor(private manager: EntityManager) {
  }

  findByUserIds(userOne: number, userTwo: number, relations: string[] = []): Promise<Nullable<Conversation>> {
    return this.manager.findOne(Conversation, {
      where: [{ userOne, userTwo }, {
        userOne: userTwo,
        userTwo: userOne
      }],
      relations
    })
  }

  findUserConversations(userId: number, relations: string[] = []): Promise<Conversation[]> {
    return this.manager.find(Conversation, {
      where: [{ userOne: userId }, { userTwo: userId }],
      relations
    });
  }

  findById(id: number, relations: string[] = []): Promise<Nullable<Conversation>> {
    return this.manager.findOne(Conversation, {
      where: { id },
      relations
    });
  }

  async updateConversationStatus(id: number, newStatus: ConversationStatus): Promise<void> {
    await this.manager.update(Conversation, id, { status: newStatus });
  }

  async save(entity: Conversation): Promise<any> {
    await this.manager.save(entity);
  }
}
