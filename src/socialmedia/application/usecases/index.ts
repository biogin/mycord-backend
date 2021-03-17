import { LikeEntityUseCase } from "./likeEntity";
import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { EntityManager } from "typeorm";
import { LikeRepository } from "../repositories/likeRepo";
import { LeaveCommentUseCase } from "./leaveComment";

export interface UseCase<Request, Result> {
  execute(request: Request): Result;
}

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: PostRepository;
  likeRepo: LikeRepository;

  // #todo ugly
  getTransactionManager(): EntityManager;
}

export function getApplicationUseCases({ userRepo, getTransactionManager, postRepo, commentRepo, profileRepo, likeRepo }: Deps): { [name: string]: UseCase<unknown, unknown> } {
  const likeEntityUseCase = new LikeEntityUseCase({ userRepo, commentRepo, postRepo, getTransactionManager, likeRepo });
  const leaveCommentUseCase = new LeaveCommentUseCase({ userRepo, commentRepo, postRepo, getTransactionManager, likeRepo });

  return {
    likeEntityUseCase,
    leaveCommentUseCase
  }
}
