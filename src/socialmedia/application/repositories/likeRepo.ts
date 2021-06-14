import { Nullable } from "../../../@types/ts";
import { Like } from "../../domain/entities/Like";
import { UpdateResult } from "typeorm";

export interface LikeRepository {
  findByUserAndCommentId(id: number, userId: number): Promise<Nullable<Like>>;

  findByUserAndPostId(id: number, userId: number): Promise<Nullable<Like>>;

  update(id: number, toUpdate: Partial<Like>): Promise<UpdateResult>;

  save(entity: Like): Promise<Like>;
}
