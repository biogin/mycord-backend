import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn, Column } from "typeorm";

import { Post } from "./Post";
import { Profile } from "./Profile";
import { Comment } from "./Comment";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Profile, profile => profile.user)
  @JoinColumn()
  profile: Profile;

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
