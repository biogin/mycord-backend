import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Post} from "./Post";
import {Comment} from "./Comment";

export enum LikedEntityType {
  Comment = 'comment',
  Post = 'post'
}

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LikedEntityType
  }) likedEntityType: LikedEntityType;

  @ManyToOne(type => Post, post => post.likes)
  post: Post;

  @ManyToOne(type => Comment, comment => comment.likes)
  comment: Comment;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;
}
