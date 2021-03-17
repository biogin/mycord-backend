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

  @ManyToOne(type => Post, post => post.likes, { nullable: true })
  post: Post;

  @ManyToOne(type => Comment, comment => comment.likes, { nullable: true })
  comment: Comment;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  static create({ user, post, comment, likedEntityType }: Partial<{ [T in keyof Like] }>): Like {
    const like = new Like();

    like.user = user;
    like.comment = comment;
    like.post = post;
    like.likedEntityType = likedEntityType;

    return like;
  }
}
