import { EntityManager, EntityRepository } from "typeorm";
import { Comment } from "../../socialmedia/domain/entities/Comment";
import { CommentRepository as ICommentRepository } from "../../socialmedia/application/repositories/commentRepo";
import { Nullable } from "../../@types/ts";

@EntityRepository(Comment)
export class CommentRepository implements ICommentRepository {
  constructor(private manager: EntityManager) {
  }

  findById(id: number): Promise<Nullable<Comment>> {
    return this.manager.findOne(Comment, id);
  }

  save(entity: Comment): Promise<Comment> {
    return this.manager.save(entity);
  }
}
