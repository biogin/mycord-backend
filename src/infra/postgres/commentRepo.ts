import { Connection } from "typeorm";
import { Comment } from "../../socialmedia/domain/entities/Comment";
import { CommentRepository } from "../../socialmedia/application/repositories/commentRepo";

export function getCommentRepo(connection: Connection): CommentRepository {
  return connection.getRepository(Comment);
}
