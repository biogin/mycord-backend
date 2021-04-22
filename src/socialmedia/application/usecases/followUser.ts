import { EntityManager } from "typeorm";
import { UserInputError } from "apollo-server-express";

import { UseCase } from "./index";
import { UserRepository } from "../repositories/userRepo";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { Follower } from "../../domain/entities/Follower";
import { ProfileRepository } from "../repositories/profileRepo";
import { FollowerRepository } from "../repositories/followerRepo";

interface Deps {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;
  followerRepo: FollowerRepository;

  getTransactionManager(): EntityManager;
}

interface FollowUserRequestDTO {
  username: string;
  followerId: number;
}

export class FollowUserUseCase implements UseCase<FollowUserRequestDTO, Promise<number>> {
  userRepo: UserRepository;
  profileRepo: ProfileRepository;
  followerRepo: FollowerRepository;

  // getTransactionManager: () => EntityManager;

  constructor({ getTransactionManager, profileRepo, userRepo, followerRepo }: Deps) {
    this.userRepo = userRepo;
    this.followerRepo = followerRepo
    this.profileRepo = profileRepo;
    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ username, followerId }: FollowUserRequestDTO): Promise<number> {
    const followedUser = await this.profileRepo.findOne({ where: { username }, relations: ['user'] });

    if (!followedUser) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User with such username doesn't exist` });
    }

    const userId = followedUser.user.id;

    const query = { followedId: userId, followerId };

    if (!(await this.followerRepo.findOne({ where: query }))) {
      const follower = Follower.create(query);

      await this.followerRepo.save(follower);

      await Promise.all([
        this.userRepo.increment({ id: userId }, 'followersCount', 1),
        this.userRepo.increment({ id: followerId }, 'followingCount', 1)
      ]);
    } else {
      const { affected } = await this.followerRepo.delete(query);

      await Promise.all([
        this.userRepo.decrement({ id: userId }, 'followersCount', 1),
        this.userRepo.decrement({ id: followerId }, 'followingCount', 1)
      ]);
    }

    return this.followerRepo.count({ where: { followedId: userId } });
  }
}
