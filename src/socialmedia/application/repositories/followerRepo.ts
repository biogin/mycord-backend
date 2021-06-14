import { Follower } from "../../domain/entities/Follower";
import { DeleteResult } from "typeorm";
import { Nullable } from "../../../@types/ts";

export interface FollowerRepository {
  followerExists(followedId: number, followerId: number): Promise<boolean>;

  findByFollowerAndFollowedId(followedId: number, followerId: number): Promise<Nullable<Follower>>

  findFollowedUserIds(userId: number): Promise<number[]>;

  deleteFollowingRelation(followerId: number, followedId: number): Promise<DeleteResult>;

  save(entity: Follower): Promise<Follower>;

  count(followedId: number): Promise<number>;
}
