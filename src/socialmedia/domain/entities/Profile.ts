import {
  BeforeInsert,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import * as argon2 from "argon2";

import { User } from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 256, nullable: true })
  firstName: string;

  @Column('varchar', { length: 256, nullable: true })
  lastName: string;

  @Column('varchar', { length: 256, default: '' })
  username: string;

  @BeforeInsert()
  async hash() {
    this.password = await argon2.hash(this.password);
  }

  @Column('text')
  password: string;

  @Column('timestamp with time zone')
  birthday: string;

  @Column('text', { nullable: true })
  imageUrl: string;

  @Column('varchar', { length: 256, unique: true })
  email: string;

  @OneToOne(type => User, user => user.profile, { onDelete: 'CASCADE' })
  user: User;

  static create({ password, email, username, imageUrl, birthday }: Partial<{ [T in keyof Profile] }>): Profile {
    const profile = new Profile();

    profile.password = password;
    profile.email = email;
    profile.username = username;
    profile.imageUrl = imageUrl;
    profile.birthday = birthday;

    return profile;
  }
}
