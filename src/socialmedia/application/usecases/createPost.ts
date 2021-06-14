import { EntityManager } from "typeorm";

import { UserRepository } from "../repositories/userRepo";
import { Post } from "../../domain/entities/Post";
import { PostRepository } from "../repositories/postRepo";
import { UserInputError } from "apollo-server-express";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { ActivityRepository } from "../repositories/activityRepo";
import { Activity } from "../../domain/entities/Activity";
import { UseCase } from "../interfaces/useCase";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  activityRepo: ActivityRepository;

  getTransactionManager(): EntityManager;
}

interface CreatePostRequestDTO {
  title: string
  audioUrl: string;
  authorId: number;
}

export class CreatePostUseCase implements UseCase<CreatePostRequestDTO, Promise<Post>> {
  userRepo: UserRepository;
  postRepo: PostRepository;
  activityRepo: ActivityRepository;

  // getTransactionManager: () => EntityManager;

  constructor({ getTransactionManager, userRepo, postRepo, activityRepo }: Deps) {
    this.userRepo = userRepo;
    this.postRepo = postRepo;
    this.activityRepo = activityRepo;
    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ title, authorId, audioUrl }: CreatePostRequestDTO): Promise<Post> {
    const user = await this.userRepo.findById(authorId);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND);
    }

    const postActivity = Activity.create();

    const { id } = await this.activityRepo.save(postActivity);

    const newPost = await Post.create({ title, audioUrl, user, activityId: id });

    await this.postRepo.save(newPost);

    return newPost;
  }
}
