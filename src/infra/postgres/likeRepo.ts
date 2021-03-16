import { Connection } from "typeorm";
import { Like } from "../../socialmedia/domain/entities/Like";
import { LikeRepository } from "../../socialmedia/application/repositories/likeRepo";

export function getLikeRepo(connection: Connection): LikeRepository {
  return connection.getRepository(Like);
}
