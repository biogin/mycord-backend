import { ConversationActivity } from "../../domain/entities/ConversationActivity";
import { UpdateResult } from "typeorm";

export interface ConversationActivityRepository {
  resetUnreadMessage(id: number): Promise<void>;

  incrementUnreadMessages(id: number): Promise<void>;

  save(entity: ConversationActivity): Promise<void>;

  update(id: number, fields: Partial<ConversationActivity>): Promise<UpdateResult>;
}
