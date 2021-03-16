import { Connection } from "typeorm";
import { PostRepository } from "../../socialmedia/application/repositories/postRepo";
import { Profile } from "../../socialmedia/domain/entities/Profile";
import { ProfileRepository } from "../../socialmedia/application/repositories/profileRepo";

export function getProfileRepo(connection: Connection): ProfileRepository {
  return connection.getRepository(Profile);
}
