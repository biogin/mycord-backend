import { Nullable } from "../../../@types/ts";
import { Post } from "../../domain/entities/Post";

export interface PostRepository {
  findOnyById(id: number): Promise<Nullable<Post>>

  findUserPosts(userId: number): Promise<Post[]>;

  findPostsByUserIds(userIds: number[]): Promise<Post[]>;

  save(entity: Post): Promise<Post>;
}
