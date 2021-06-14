import { User } from "../../domain/entities/User";
import { Nullable } from "../../../@types/ts";
import { UpdateResult } from "typeorm";

export interface UserRepository {
  findUsers(ids: number[], relations?: string[]): Promise<User[]>;

  findById(id: number, relations?: string[]): Promise<Nullable<User>>;

  incrementCount(id, field: keyof Pick<User, 'followersCount' | 'followingCount'>): Promise<UpdateResult>;

  decrementCount(id, field: keyof Pick<User, 'followersCount' | 'followingCount'>): Promise<UpdateResult>;

  save(entity: User): Promise<User>;
}
