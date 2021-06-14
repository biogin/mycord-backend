import { EntityManager, EntityRepository, In, UpdateResult } from "typeorm";
import { User } from "../../socialmedia/domain/entities/User";
import { UserRepository as IUserRepository } from "../../socialmedia/application/repositories/userRepo";
import { Nullable } from "../../@types/ts";

@EntityRepository(User)
export class UserRepository implements IUserRepository {
  constructor(private manager: EntityManager) {
  }

  findUsers(ids: number[], relations: string[] = []): Promise<User[]> {
    return this.manager.find(User, { where: { id: In(ids) }, relations });
  }

  findById(id: number, relations: string[] = []): Promise<Nullable<User>> {
    return this.manager.findOne(User, { where: { id }, relations });
  }

  decrementCount(id: number, field: keyof Pick<User, 'followersCount' | 'followingCount'>): Promise<UpdateResult> {
    return this.manager.decrement(User, { id }, field, 1);
  }

  incrementCount(id: number, field: keyof Pick<User, 'followersCount' | 'followingCount'>): Promise<UpdateResult> {
    return this.manager.increment(User, { id }, field, 1);
  }

  save(entity: User): Promise<User> {
    return this.manager.save(entity);
  }
}
