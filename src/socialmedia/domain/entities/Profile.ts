import {
  BeforeInsert,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import * as argon2 from "argon2";

import {User} from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 256 })
  name: string;

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

  @OneToOne(type => User, user => user.profile)
  user: User;

  static create({ password, email, name, imageUrl, birthday }: Partial<{ [T in keyof Profile] }>): Profile {
    const profile = new Profile();

    profile.password = password;
    profile.email = email;
    profile.name = name;
    profile.imageUrl = imageUrl;
    profile.birthday = birthday;

    return profile;
  }
}
