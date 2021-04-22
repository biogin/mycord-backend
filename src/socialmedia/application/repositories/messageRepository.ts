import { Repository } from "typeorm";
import { Message } from "../../domain/entities/Message";

export interface MessageRepository extends Repository<Message> {}
