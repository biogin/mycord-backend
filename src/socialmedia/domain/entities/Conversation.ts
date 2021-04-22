import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";

enum ConversationStatus {
  NewMessage = 'new-message',
  Default = 'default',
  Deleted = 'deleted'
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn() id: number;

  @Column('int') userOne: number;

  @Column('int') userTwo: number;

  @OneToMany(() => Message, message => message.conversation)
  messages: Array<Message>;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.Default
  }) status: ConversationStatus;
}
