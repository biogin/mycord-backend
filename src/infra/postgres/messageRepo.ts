import { EntityManager, EntityRepository } from "typeorm";

import { MessageRepository as IMessageRepository } from "../../socialmedia/application/repositories/messageRepo";
import { Message } from "../../socialmedia/domain/entities/Message";

@EntityRepository(Message)
export class MessageRepository implements IMessageRepository {
  constructor(private manager: EntityManager) {
  }

  save(entity: Message): Promise<Message> {
    return this.manager.save(entity);
  }
}
