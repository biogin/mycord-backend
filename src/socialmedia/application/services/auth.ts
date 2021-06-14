import { UserInputError } from "apollo-server-express";
import * as argon2 from 'argon2';

import validateEmail from "../../../utils/validateEmail";

import { User } from "../../domain/entities/User";
import { Profile } from "../../domain/entities/Profile";

import { UserRepository } from "../repositories/userRepo";
import { ProfileRepository } from "../repositories/profileRepo";
import { DUPLICATE_EMAIL, DUPLICATE_USERNAME } from "../../controllers/graphql/constants/errors";

const invalidCredentialsError = () => {
  throw new UserInputError('invalid_credentials');
}

interface Args {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;
}

interface LoginInput {
  email: string;
  username?: string;
  password: string;
}

interface SignupInput extends LoginInput {
  birthday: string;
  username: string;
  imageUrl?: string;
  bio?: string;
}

export class AuthService {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;

  constructor({ userRepo, profileRepo }: Args) {
    this.userRepo = userRepo;
    this.profileRepo = profileRepo;
  }

  async login({ email, password }: LoginInput): Promise<User> {
    if (!validateEmail(email)) {
      return invalidCredentialsError();
    }

    const profile = await this.profileRepo.findOneByEmail(email);

    if (!profile || !(await argon2.verify(profile.password, password))) {
      return invalidCredentialsError();
    }

    profile.user.profile = profile;

    return profile.user;
  }

  async signup({ email, password, username, imageUrl, birthday }: SignupInput): Promise<User> {
    const p = await this.profileRepo.findOneByEmailOrUsername(email, username);

    if (!!p) {
      const error = username === p.username ? DUPLICATE_USERNAME : DUPLICATE_EMAIL;
      throw new UserInputError(error, { message: error });
    }

    const profile = Profile.create({ email, password, username, imageUrl, birthday });

    await this.profileRepo.save(profile);

    const newUser = User.create({ profile });

    newUser.profile = profile;

    await this.userRepo.save(newUser);

    return newUser;
  }
}
