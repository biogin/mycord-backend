import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import {User} from "./User";
import {Like} from "./Like";
import {Comment} from "./Comment";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  activityId: number;

  @Column('varchar', {length: 100, default: '' })
  title: string;

  @Column('text', { default: ''  })
  audioUrl: string;

  @ManyToOne(type => User, user => user.posts)
  user: User;

  @OneToMany(type => Like, like => like.post, { onDelete: 'CASCADE' })
  likes: Array<Like>;

  @OneToMany(type => Comment, comment => comment.post, { onDelete: 'CASCADE' })
  comments: Array<Comment>;

  @CreateDateColumn()
  createdAt: Date;

  static create({ audioUrl, title, user, activityId }: Partial<{ [T in keyof Post] }>): Post {
    const post = new Post();

    post.audioUrl =  audioUrl;
    post.title =  title;
    post.user = user;
    post.activityId = activityId;

    return post;
  }
}
