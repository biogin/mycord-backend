import { Connection } from "typeorm";
import { PostRepository } from "../../socialmedia/application/repositories/postRepo";
import { Post } from "../../socialmedia/domain/entities/Post";

export function getPostRepo(connection: Connection): PostRepository {
  return connection.getRepository(Post);
}

