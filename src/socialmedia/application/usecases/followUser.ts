import { EntityManager } from "typeorm";
import { UserInputError } from "apollo-server-express";

import { UserRepository } from "../repositories/userRepo";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { Follower } from "../../domain/entities/Follower";
import { ProfileRepository } from "../repositories/profileRepo";
import { FollowerRepository } from "../repositories/followerRepo";
import { UseCase } from "../interfaces/useCase";

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
    const followedUser = await this.profileRepo.findOneByUsername(username, ['user']);

    if (!followedUser) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User with such username doesn't exist` });
    }

    const userId = followedUser.user.id;

    const query = { followedId: userId, followerId };

    if (!(await this.followerRepo.followerExists(query.followedId, query.followerId))) {
      const follower = Follower.create(query);

      await this.followerRepo.save(follower);

      await Promise.all([
        this.userRepo.incrementCount(userId, 'followersCount'),
        this.userRepo.incrementCount(followerId, 'followingCount')
      ]);
    } else {
      const { affected } = await this.followerRepo.deleteFollowingRelation(followerId, userId);

      await Promise.all([
        this.userRepo.decrementCount(userId, 'followersCount'),
        this.userRepo.decrementCount(followerId, 'followingCount')
      ]);
    }

    return this.followerRepo.count(userId);
  }
}
