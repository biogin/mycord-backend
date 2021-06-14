import { EntityManager, EntityRepository, UpdateResult } from "typeorm";
import { Like } from "../../socialmedia/domain/entities/Like";
import { LikeRepository as ILikeRepo } from "../../socialmedia/application/repositories/likeRepo";
import { Nullable } from "../../@types/ts";

@EntityRepository(Like)
export class LikeRepository implements ILikeRepo {
  constructor(private manager: EntityManager) {
  }

  findByUserAndCommentId(commentId: number, userId: number): Promise<Nullable<Like>> {
    return this.manager.findOne(Like, { where: { user: { id: userId }, comment: { id: commentId } } });
  }

  findByUserAndPostId(postId: number, userId: number): Promise<Nullable<Like>> {
    return this.manager.findOne(Like, { where: { user: { id: userId }, post: { id: postId } } });
  }

  update(id: number, toUpdate: Partial<Like>): Promise<UpdateResult> {
    return this.manager.update(Like, { id }, toUpdate);
  }

  async save(entity: Like): Promise<Like> {
    return await this.manager.save(entity);
  }
}
