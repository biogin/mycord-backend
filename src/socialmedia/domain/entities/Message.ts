import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne } from "typeorm";

import { Conversation } from "./Conversation";

const MAX_MESSAGE_LENGTH = 10000;

@Entity()
export class Message {
  @PrimaryGeneratedColumn() id: number;

  @Column('varchar', { length: MAX_MESSAGE_LENGTH })
  text: string;

  @Column('integer')
  senderId: number;

  @Column('integer')
  receiverId: number;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @Column('varchar', {
    length: 100
  }) createdAt: string;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = Date.now().toString();
  }

  static create({ text, receiverId, senderId, conversation }: Partial<{ [K in keyof Message] }>): Message {
    const message = new Message();

    message.text = text;
    message.senderId = senderId;
    message.receiverId = receiverId;
    message.conversation = conversation;

    return message;
  }
}
