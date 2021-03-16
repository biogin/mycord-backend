import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Like} from "./Like";
import {Comment} from "./Comment";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {length: 1000, default: '' })
  description: string;

  @Column('varchar', {length: 100, default: '' })
  title: string;

  @Column('text', { default: ''  })
  audioUrl: string;

  @ManyToOne(type => User, user => user.posts)
  user: User;

  @OneToMany(type => Like, like => like.post)
  likes: Array<Like>;

  @OneToMany(type => Comment, comment => comment.post)
  comments: Array<Comment>;

  static create({ audioUrl, description, title }: Partial<{ [T in keyof Post] }>): Post {
    const post = new Post();

    post.audioUrl =  audioUrl;
    post.title =  title;
    post.description =  description;

    return post;
  }
}
