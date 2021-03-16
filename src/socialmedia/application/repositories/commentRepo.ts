import { Repository } from "typeorm";
import { Comment } from "../../domain/entities/Comment";

export interface CommentRepository extends Repository<Comment> {}
