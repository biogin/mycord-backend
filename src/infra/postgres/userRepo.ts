import { Connection } from "typeorm";
import { User } from "../../socialmedia/domain/entities/User";
import { UserRepository } from "../../socialmedia/application/repositories/userRepo";

export function getUserRepo(connection: Connection): UserRepository {
 return connection.getRepository(User);
}

