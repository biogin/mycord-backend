import { Comment } from "../../domain/entities/Comment";
import { Nullable } from "../../../@types/ts";

export interface CommentRepository {
  findById(id: number): Promise<Nullable<Comment>>;

  save(entity: Comment): Promise<Comment>;
}
