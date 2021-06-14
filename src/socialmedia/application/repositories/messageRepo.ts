import { Message } from "../../domain/entities/Message";

export interface MessageRepository {
  save(entity: Message): Promise<Message>;
}
