import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Follower {
  @PrimaryGeneratedColumn() id;

  @Column('integer')
  followerId: number;

  @Column('integer')
  followedId: number;

  static create({ followedId, followerId }: Partial<{ [T in keyof Follower] }>): Follower {
    const follower = new Follower();

    follower.followerId = followerId;
    follower.followedId = followedId;

    return follower;
  }
}
