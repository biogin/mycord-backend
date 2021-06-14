import { EntityManager, EntityRepository, In } from "typeorm";

import { Post } from "../../socialmedia/domain/entities/Post";
import { PostRepository as IPostRepository } from "../../socialmedia/application/repositories/postRepo";
import { Nullable } from "../../@types/ts";

@EntityRepository(Post)
export class PostRepository implements IPostRepository {
  constructor(private manager: EntityManager) {
  }

  findOnyById(id: number): Promise<Nullable<Post>> {
    return this.manager.findOne(Post, id);
  }

  findUserPosts(userId: number): Promise<Post[]> {
    return this.manager.find(Post, { relations: ['user'], where: { user: { id: userId } } });
  }

  async findPostsByUserIds(userIds: number[]): Promise<Post[]> {
    if (userIds.length === 0) {
      return [];
    }

    return this.manager.find(Post, {
      where: { user: { id: In(userIds) } },
      order: {
        createdAt: 'DESC'
      },
      relations: ['user']
    });
  }

  save(entity: Post): Promise<Post> {
    return this.manager.save(entity);
  }
}
