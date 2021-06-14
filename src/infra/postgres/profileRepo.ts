import { EntityManager, EntityRepository, UpdateResult } from "typeorm";
import { Profile } from "../../socialmedia/domain/entities/Profile";
import { ProfileRepository as IProfileRepository } from "../../socialmedia/application/repositories/profileRepo";
import { Nullable } from "../../@types/ts";

@EntityRepository(Profile)
export class ProfileRepository implements IProfileRepository {
  constructor(private manager: EntityManager) {
  }

  findOneByEmail(email: string, relations: string[] = []): Promise<Nullable<Profile>> {
    return this.manager.findOne(Profile, { relations, where: { email } });
  }

  findOneByUsername(username: string, relations: string[] = []): Promise<Nullable<Profile>> {
    return this.manager.findOne(Profile, { where: { username }, relations });
  }

  updateProfile(username: string, { imageUrl }: Partial<Profile>): Promise<UpdateResult> {
    return this.manager.update(Profile, { username }, { imageUrl });
  }

  findOneByEmailOrUsername(email: string, username: string): Promise<Nullable<Profile>> {
    return this.manager.findOne(Profile, { where: [{ email }, { username }] });
  }

  save(entity: Profile): Promise<Profile> {
    return this.manager.save(entity);
  }
}
