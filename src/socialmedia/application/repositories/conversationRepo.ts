import { Repository } from "typeorm";
import { Conversation } from "../../domain/entities/Conversation";

export interface ConversationRepository extends Repository<Conversation> {}
