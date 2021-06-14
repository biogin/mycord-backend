import { UserInputError } from "apollo-server-express";

import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { EntityManager } from "typeorm";
import { Comment } from "../../domain/entities/Comment";
import { USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { Activity } from "../../domain/entities/Activity";
import { ActivityRepository } from "../repositories/activityRepo";
import { UseCase } from "../interfaces/useCase";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  activityRepo: ActivityRepository;

  getTransactionManager(): EntityManager;
}

interface LeaveCommentRequestDTO {
  postId: number;
  userId: number;
  text: string;
}

export class LeaveCommentUseCase implements UseCase<LeaveCommentRequestDTO, Promise<Comment>> {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  activityRepo: ActivityRepository;
  // getTransactionManager: () => EntityManager;

  constructor({ userRepo, postRepo, commentRepo, getTransactionManager, activityRepo }: Deps) {
    this.userRepo = userRepo;
    this.commentRepo = commentRepo;
    this.postRepo = postRepo;
    this.activityRepo = activityRepo;

    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ postId, text, userId } : LeaveCommentRequestDTO): Promise<Comment> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User leaving a comment doesn't exist ¯\\_(ツ)_/¯` });
    }

    const post = await this.postRepo.findOnyById(postId);

    if (!post) {
      throw new UserInputError(USER_NOT_FOUND, { message: `Post doesn't exist ${postId}` });
    }

    const activity = Activity.create();

    const { id } = await this.activityRepo.save(activity)

    const comment = Comment.create({ post, user, text, activityId: id });

    return this.commentRepo.save(comment);
  }
}
