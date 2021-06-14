import { Conversation, ConversationStatus } from "../../domain/entities/Conversation";
import { Nullable } from "../../../@types/ts";

export interface ConversationRepository {
  findByUserIds(userOne: number, userTwo: number, relations?: string[]): Promise<Nullable<Conversation>>;

  findUserConversations(userId: number, relations?: string[]): Promise<Conversation[]>;

  findById(id: number, relations?: string[]): Promise<Nullable<Conversation>>;

  updateConversationStatus(id: number, newStatus: ConversationStatus): Promise<void>;

  save(entity: any): Promise<any>;
}
