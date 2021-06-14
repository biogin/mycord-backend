import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./Conversation";

@Entity()
export class ConversationActivity {
  @PrimaryGeneratedColumn() id: number;

  @OneToOne(() => Conversation, conversation => conversation.activity)
  conversation: Conversation;

  @Column('bigint', { default: 0 })
  unreadMessages: number;

  @Column('int')
  userId: number;

  static create({ conversation, userId }: Partial<{ [T in keyof ConversationActivity] }>): ConversationActivity {
    const c = new ConversationActivity();

    c.conversation = conversation;
    c.userId = userId;

    return c;
  }
}
