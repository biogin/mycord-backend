import { UpdateResult } from 'typeorm';
import { Nullable } from "../../../@types/ts";
import { Profile } from "../../domain/entities/Profile";

export interface ProfileRepository {
  findOneByUsername(username: string, relations?: string[]): Promise<Nullable<Profile>>;

  findOneByEmail(email: string, relations?: string[]): Promise<Nullable<Profile>>;

  findOneByEmailOrUsername(email: string, username: string): Promise<Nullable<Profile>>;

  updateProfile(username: string, profileDetails: Partial<Profile>): Promise<UpdateResult>;

  save(entity: Profile): Promise<Profile>;
}
