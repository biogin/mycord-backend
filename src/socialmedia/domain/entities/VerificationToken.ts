import {
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  BeforeInsert,
  BeforeUpdate
} from "typeorm";

import { User } from "./User";

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, nullable: true })
  token: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column('timestamp with time zone')
  updateAt: Date;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  update(): void {
    this.updateAt = new Date();
  }

  @OneToOne(() => User, user => user.verificationToken)
  @JoinColumn()
  user: User;

  static create({ token }: Partial<{ [T in keyof VerificationToken] }>): VerificationToken {
    const verificationToken = new VerificationToken();

    verificationToken.token = token;

    return verificationToken;
  }
}
