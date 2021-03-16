import { Repository } from "typeorm";
import { Profile } from "../../domain/entities/Profile";

export interface ProfileRepository extends Repository<Profile> {}
