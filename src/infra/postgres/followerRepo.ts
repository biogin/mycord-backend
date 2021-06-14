import { DeleteResult, EntityManager, EntityRepository } from "typeorm";

import { FollowerRepository as IFollowerRepository } from "../../socialmedia/application/repositories/followerRepo";
import { Follower } from "../../socialmedia/domain/entities/Follower";
import { Nullable } from "../../@types/ts";

@EntityRepository(Follower)
export class FollowerRepository implements IFollowerRepository {
  constructor(private manager: EntityManager) {
  }

  async followerExists(followedId: number, followerId: number): Promise<boolean> {
    return !!(await this.manager.findOne(Follower, {
      where: {
        followedId,
        followerId
      }
    }));
  }

  findByFollowerAndFollowedId(followedId: number, followerId: number): Promise<Nullable<Follower>> {
    return this.manager.findOne(Follower, { where: { followedId, followerId } })
  }

  async findFollowedUserIds(userId: number): Promise<number[]> {
    return (await this.manager.find(Follower, {
      where: { followerId: userId },
      select: ['followedId']
    })).map(_ => _.followedId);
  }

  save(entity: Follower): Promise<Follower> {
    return this.manager.save(entity);
  }

  deleteFollowingRelation(followerId: number, followedId: number): Promise<DeleteResult> {
    return this.manager.delete(Follower, { followerId, followedId });
  }

  count(followedId: number): Promise<number> {
    return this.manager.count(Follower, { where: { followedId } });
  }

}
