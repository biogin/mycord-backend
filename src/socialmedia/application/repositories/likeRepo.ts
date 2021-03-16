import { Repository } from "typeorm";
import { Like } from "../../domain/entities/Like";

export interface LikeRepository extends Repository<Like> {}
