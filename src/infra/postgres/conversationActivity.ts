import { EntityManager, EntityRepository, UpdateResult } from "typeorm";

import { ConversationActivityRepository as IConversationActivityRepository } from "../../socialmedia/application/repositories/conversationActivityRepo";
import { ConversationActivity } from "../../socialmedia/domain/entities/ConversationActivity";

@EntityRepository(ConversationActivity)
export class ConversationActivityRepository implements IConversationActivityRepository {
  constructor(private manager: EntityManager) {
  }

  async save(entity: ConversationActivity): Promise<void> {
    await this.manager.save(entity);
  }

  async resetUnreadMessage(id: number): Promise<void> {
    await this.manager.update(ConversationActivity, id, { unreadMessages: 0 })
  }

  update(id: number, fields: Partial<ConversationActivity>): Promise<UpdateResult> {
    return this.manager.update(ConversationActivity, id, fields);
  }

  async incrementUnreadMessages(id: number): Promise<void> {
    await this.manager.increment(ConversationActivity, { id }, 'unreadMessages', 1);
  }
}
