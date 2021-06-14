import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";
import { ConversationActivity } from "./ConversationActivity";

export enum ConversationStatus {
  NewMessage = 'New-message',
  Default = 'Default',
  Deleted = 'Deleted'
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn() id: number;

  @Column('int') userOne: number;

  @Column('int') userTwo: number;

  @OneToMany(() => Message, message => message.conversation)
  messages: Array<Message>;

  @OneToOne(() => ConversationActivity, activity => activity.conversation)
  @JoinColumn()
  activity: ConversationActivity;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.Default,
  }) status: ConversationStatus;
}
