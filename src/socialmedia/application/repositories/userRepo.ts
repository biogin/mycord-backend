import { Repository } from "typeorm";

import { User } from "../../domain/entities/User";

export interface UserRepository extends Repository<User> {}
