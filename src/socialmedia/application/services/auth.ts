import { UserInputError } from "apollo-server-express";
import * as argon2 from 'argon2';

import { User } from "../../domain/entities/User";
import validateEmail from "../../../utils/validateEmail";
import { UserRepository } from "../repositories/userRepo";
import { ProfileRepository } from "../repositories/profileRepo";
import { Profile } from "../../domain/entities/Profile";

const invalidCredentialsError = () => {
  throw new UserInputError('Invalid credentials');
}

interface Args {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;
}

interface LoginInput {
  email: string;
  name?: string;
  password: string;
}

interface SignupInput extends LoginInput {
  name?: string;
  imageUrl: string;
  bio?: string;
}

export class AuthService {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;

  constructor({ userRepo, profileRepo }: Args) {
    this.userRepo = userRepo;
    this.profileRepo = profileRepo;
  }

  async login({ email, password }: LoginInput): Promise<Profile> {
    if (!validateEmail(email)) {
      return invalidCredentialsError();
    }

    const profile = await this.profileRepo.findOne({ where: { email }, relations: ['user'] });

    if (!profile || !(await argon2.verify(profile.password, password))) {
      return invalidCredentialsError();
    }

    return profile;
  }

  async signup({ email, password, name, imageUrl }: SignupInput): Promise<User> {
    if (await this.profileRepo.findOne({ where: { email } })) {
      throw new UserInputError('User with such email already exists.');
    }
    const profile = Profile.create({ email, password, name, imageUrl });

    await this.profileRepo.save(profile);

    const newUser = User.create({ profile });

    return await this.userRepo.save(newUser);
  }
}
