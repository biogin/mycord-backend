import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Like} from "./Like";
import {Post} from "./Post";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {length: 1000, default: ''})
  text;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Post)
  post: Post;

  @OneToMany(() => Like, like => like.comment)
  likes: Array<Like>;

  static create({ text, post, user }: Partial< { [T in keyof Comment] } >): Comment {
    const comment = new Comment();

    comment.user = user;
    comment.post = post;
    comment.text = text;

    return comment;
  }
}
