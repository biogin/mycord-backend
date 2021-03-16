import { Repository } from "typeorm";
import { Post } from "../../domain/entities/Post";

export interface PostRepository extends Repository<Post> {}
