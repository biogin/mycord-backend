import { UserInputError } from "apollo-server-express";

import { UseCase } from "./index";
import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { LikeRepository } from "../repositories/likeRepo";
import { EntityManager } from "typeorm";
import { Comment } from "../../domain/entities/Comment";
import { USER_NOT_FOUND } from "../../controllers/graphql/errors";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  likeRepo: LikeRepository;

  getTransactionManager(): EntityManager;
}

interface LeaveCommentRequestDTO {
  postId: string;
  userId: string;
  commentText: string;
}

export class LeaveCommentUseCase implements UseCase<LeaveCommentRequestDTO, Promise<Comment>> {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  // getTransactionManager: () => EntityManager;

  constructor({ userRepo, postRepo, commentRepo, getTransactionManager, likeRepo }: Deps) {
    this.userRepo = userRepo;
    this.commentRepo = commentRepo;
    this.postRepo = postRepo;

    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ postId, commentText, userId } : LeaveCommentRequestDTO): Promise<Comment> {
    const user = await this.userRepo.findOne(userId);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User leaving a comment doesn't exist ¯\\_(ツ)_/¯` });
    }

    const post = await this.postRepo.findOne(postId);

    if (!post) {
      throw new UserInputError(USER_NOT_FOUND, { message: `Post doesn't exist ${postId}` });
    }

    const comment = Comment.create({ post, user, text: commentText });

    return this.commentRepo.save(comment);
  }
}
