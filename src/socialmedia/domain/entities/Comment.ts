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

  @OneToOne(() => User)
  user: User;

  @ManyToOne(() => Post)
  post: Post;

  @OneToMany(() => Like, like => like.comment)
  likes: Array<Like>;
}
