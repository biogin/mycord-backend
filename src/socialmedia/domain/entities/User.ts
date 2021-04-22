import {
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column, BeforeInsert,
} from "typeorm";

import { Post } from "./Post";
import { Profile } from "./Profile";
import { Comment } from "./Comment";
import { VerificationToken } from "./VerificationToken";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('date')
  joinedAt: Date;

  @BeforeInsert()
  setJoinedAt() {
    this.joinedAt = new Date();
  }

  @Column('integer', { default: 0 })
  followersCount: number;

  @Column('integer', { default: 0 })
  followingCount: number;

  @OneToOne(() => Profile, profile => profile.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => VerificationToken, token => token.user, { onDelete: 'CASCADE' })
  verificationToken: VerificationToken;

  @OneToMany(type => Post, post => post.user, { cascade: true })
  posts: Array<Post>;

  @OneToMany(type => Comment, comment => comment.user)
  comments: Array<Comment>;

  static create({ profile }: Partial<{ [T in keyof User] }>): User {
    const user = new User();

    user.profile = profile;

    return user;
  }
}
